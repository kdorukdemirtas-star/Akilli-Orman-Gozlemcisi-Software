#!/usr/bin/env python3
"""OpenAI-compatible fan-in on :8080. UI sends model=hizli|derin. Never echo GGUF names."""

from __future__ import annotations

import json
import os
import re
import signal
import subprocess
import threading
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

LISTEN = os.environ.get("LISTEN", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8080"))
LLAMA_BIN = os.environ.get("LLAMA_BIN", "/home/demir/aog-pi/llama.cpp/build/bin/llama-server")
AOG_MD = os.environ.get("AOG_MD", "/home/demir/aog-pi/AOG.md")
HIZLI_GGUF = os.environ.get(
    "HIZLI_GGUF",
    "/home/demir/aog-pi/models/Qwen_Qwen3.5-0.8B-Q4_K_M.gguf",
)
DERIN_GGUF = os.environ.get(
    "DERIN_GGUF",
    "/home/demir/aog-pi/models/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf",
)
HIZLI_PORT = int(os.environ.get("HIZLI_PORT", "18080"))
DERIN_PORT = int(os.environ.get("DERIN_PORT", "18081"))

KIPS = {
    "hizli": {
        "gguf": HIZLI_GGUF,
        "port": HIZLI_PORT,
        "ctx": 1536,
        "threads": 3,
        "missing": "Hızlı cevaplar henüz hazır değil. Biraz sonra yeniden dene.",
    },
    "derin": {
        "gguf": DERIN_GGUF,
        "port": DERIN_PORT,
        "ctx": 1536,
        "threads": 2,
        "missing": "Derin cevaplar henüz hazır değil. Hızlı cevapları dene veya biraz sonra yeniden gönder.",
    },
}

NAME_RE = re.compile(r"(?i)qwen[\w.\-]*|deepseek[\w.\-]*|llama[\w.\-]*|\.gguf")
THINK_RE = re.compile(r"<think>[\s\S]*?</think>", re.I)
PATH_RE = re.compile(r"(?i)(?:/home|/opt|/usr|models/)[^\s\"']+")
MAX_BODY = 65536
MAX_MSGS = 24
RATE_WINDOW = 60
RATE_MAX = 60
IN_FLIGHT_MAX = 2
DEFAULT_CORS = (
    "https://akilli-orman-gozlemcisi-software.vercel.app",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
)

lock = threading.Lock()
rate_lock = threading.Lock()
rate_hits = {}
in_flight = 0
current = ""
child = None


def as_kip(raw):
    return "derin" if str(raw or "").strip().lower() == "derin" else "hizli"


def kip_rule(kip):
    if kip == "derin":
        return "Kip: derin. Gerekirse adım adım yaz. Yalnız bu kaynaktan. Model adı söyleme."
    return "Kip: hızlı. Kısa cevap. Yalnız bu kaynaktan. Model adı söyleme."


def read_facts():
    try:
        text = Path(AOG_MD).read_text(encoding="utf-8").strip()
    except OSError:
        return ""
    if len(text) > 8000:
        return text[:8000]
    return text


def cors_origins():
    raw = os.environ.get("CHAT_CORS_ORIGIN", "").strip()
    if raw:
        return tuple(part.strip() for part in raw.split(",") if part.strip())
    return DEFAULT_CORS


def allowed_origin(origin):
    origin = (origin or "").strip()
    if origin in cors_origins():
        return origin
    return ""


def peer_ip(handler):
    cf = (handler.headers.get("CF-Connecting-IP") or "").strip()
    if cf:
        return cf[:64]
    return handler.client_address[0]


def take_rate(ip):
    now = time.time()
    with rate_lock:
        hits = [stamp for stamp in rate_hits.get(ip, []) if now - stamp < RATE_WINDOW]
        if len(hits) >= RATE_MAX:
            rate_hits[ip] = hits
            return False
        hits.append(now)
        rate_hits[ip] = hits
        if len(rate_hits) > 512:
            stale = [key for key, stamps in rate_hits.items() if not stamps or now - stamps[-1] >= RATE_WINDOW]
            for key in stale:
                rate_hits.pop(key, None)
        return True


def take_slot():
    global in_flight
    with rate_lock:
        if in_flight >= IN_FLIGHT_MAX:
            return False
        in_flight += 1
        return True


def release_slot():
    global in_flight
    with rate_lock:
        in_flight = max(0, in_flight - 1)


def apply_system(payload, kip):
    # Always replace client system with AOG.md + kip rule.
    msgs = payload.get("messages")
    if not isinstance(msgs, list):
        msgs = []
    rest = []
    for row in msgs:
        if not isinstance(row, dict):
            continue
        role = row.get("role")
        if role not in ("user", "assistant"):
            continue
        content = str(row.get("content") or "")[:4000]
        if not content.strip():
            continue
        rest.append({"role": role, "content": content})
    rest = rest[-MAX_MSGS:]
    facts = read_facts()
    system = f"{facts}\n\n{kip_rule(kip)}" if facts else kip_rule(kip)
    payload["messages"] = [{"role": "system", "content": system}, *rest]
    cap = 320 if kip == "derin" else 192
    try:
        n = int(payload.get("max_tokens"))
    except (TypeError, ValueError):
        n = cap
    payload["max_tokens"] = max(32, min(n, cap))
    return payload


def slim_payload(payload, kip):
    slim = {
        "model": kip,
        "messages": payload["messages"],
        "max_tokens": payload["max_tokens"],
        "temperature": 0.4 if kip == "derin" else 0.2,
        "stream": False,
    }
    try:
        temp = float(payload.get("temperature"))
    except (TypeError, ValueError):
        temp = slim["temperature"]
    if 0 <= temp <= 1.5:
        slim["temperature"] = temp
    return slim


def scrub(text):
    cleaned = THINK_RE.sub("", str(text or ""))
    cleaned = PATH_RE.sub("", cleaned)
    cleaned = NAME_RE.sub("", cleaned)
    cleaned = re.sub(r"(?i)\b0\.8b\b", "", cleaned)
    cleaned = re.sub(r"(?i)\b1\.5b\b", "", cleaned)
    return re.sub(r"[ \t]{2,}", " ", cleaned).strip()


def healthy(port):
    for path in ("/health", "/v1/models"):
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{port}{path}", timeout=1) as res:
                if 200 <= res.status < 300:
                    return True
        except Exception:
            continue
    return False


def stop_child():
    global child, current
    proc = child
    child = None
    current = ""
    if not proc:
        return
    try:
        os.killpg(proc.pid, signal.SIGTERM)
    except Exception:
        try:
            proc.send_signal(signal.SIGTERM)
        except Exception:
            pass
    try:
        proc.wait(timeout=12)
        return
    except Exception:
        pass
    try:
        os.killpg(proc.pid, signal.SIGKILL)
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass
    try:
        proc.wait(timeout=5)
    except Exception:
        pass


def start_kip(kip):
    global child, current
    spec = KIPS[kip]
    if not os.path.isfile(spec["gguf"]):
        return False
    if not os.path.isfile(LLAMA_BIN):
        return False
    stop_child()
    cmd = [
        LLAMA_BIN,
        "-m",
        spec["gguf"],
        "--host",
        "127.0.0.1",
        "--port",
        str(spec["port"]),
        "-c",
        str(spec["ctx"]),
        "-t",
        str(spec["threads"]),
        "--jinja",
        "--reasoning",
        "off",
    ]
    log_path = os.path.join(os.path.dirname(spec["gguf"]), f"llama-{kip}.log")
    log_f = open(log_path, "ab", buffering=0)
    child = subprocess.Popen(
        cmd,
        stdout=log_f,
        stderr=log_f,
        start_new_session=True,
    )
    deadline = time.time() + 90
    while time.time() < deadline:
        if child.poll() is not None:
            child = None
            return False
        if healthy(spec["port"]):
            current = kip
            return True
        time.sleep(0.4)
    stop_child()
    return False


def ensure(kip):
    spec = KIPS[kip]
    with lock:
        if current == kip and child and child.poll() is None and healthy(spec["port"]):
            return True
        return start_kip(kip)


def forward(kip, payload):
    spec = KIPS[kip]
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"http://127.0.0.1:{spec['port']}/v1/chat/completions",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=180) as res:
        return json.loads(res.read().decode("utf-8"))


def hide_model(data, kip):
    if not isinstance(data, dict):
        return {"model": kip, "choices": []}
    data["model"] = kip
    for choice in data.get("choices") or []:
        msg = choice.get("message") or {}
        content = scrub(msg.get("content"))
        reason = scrub(msg.get("reasoning_content"))
        if not content and reason:
            content = reason
        msg["content"] = content
        if "reasoning_content" in msg:
            msg["reasoning_content"] = ""
        choice["message"] = msg
    return data


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        return

    def _cors(self):
        origin = allowed_origin(self.headers.get("Origin"))
        if origin:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Headers", "content-type, authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def _send(self, code, payload):
        blob = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(blob)))
        self.end_headers()
        self.wfile.write(blob)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path in ("/health", "/"):
            self._send(200, {"ok": True, "kips": ["hizli", "derin"]})
            return
        if path == "/v1/models":
            self._send(
                200,
                {
                    "object": "list",
                    "data": [
                        {"id": "hizli", "object": "model"},
                        {"id": "derin", "object": "model"},
                    ],
                },
            )
            return
        self._send(404, {"error": {"message": "Bu adres bulunamadı."}})

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if path != "/v1/chat/completions":
            self._send(404, {"error": {"message": "Bu adres bulunamadı."}})
            return
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            self._send(400, {"error": {"message": "İstek okunamadı. Soruyu kısaltıp yeniden gönder."}})
            return
        if length < 0 or length > MAX_BODY:
            self._send(400, {"error": {"message": "İstek okunamadı. Soruyu kısaltıp yeniden gönder."}})
            return
        raw = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._send(400, {"error": {"message": "İstek okunamadı. Soruyu kısaltıp yeniden gönder."}})
            return
        if not isinstance(payload, dict):
            self._send(400, {"error": {"message": "İstek okunamadı. Soruyu kısaltıp yeniden gönder."}})
            return
        kip = as_kip(payload.get("model"))
        if not take_rate(peer_ip(self)):
            self._send(429, {"error": {"message": "Çok sık istek geldi. Biraz bekleyip yeniden gönder."}})
            return
        apply_system(payload, kip)
        outbound = slim_payload(payload, kip)
        if not os.path.isfile(KIPS[kip]["gguf"]):
            self._send(503, {"error": {"message": KIPS[kip]["missing"]}})
            return
        if not take_slot():
            self._send(429, {"error": {"message": "Asistan meşgul. Birkaç saniye bekleyip yeniden gönder."}})
            return
        try:
            if not ensure(kip):
                self._send(503, {"error": {"message": KIPS[kip]["missing"]}})
                return
            data = hide_model(forward(kip, outbound), kip)
        except TimeoutError:
            self._send(
                504,
                {
                    "error": {
                        "message": "Yanıt zaman aşımına uğradı. Hızlı cevapları dene veya biraz sonra yeniden gönder."
                    }
                },
            )
            return
        except urllib.error.URLError as err:
            reason = str(getattr(err, "reason", err) or err).lower()
            timed_out = "timed out" in reason or isinstance(getattr(err, "reason", None), TimeoutError)
            self._send(
                504 if timed_out else 502,
                {
                    "error": {
                        "message": (
                            "Yanıt zaman aşımına uğradı. Hızlı cevapları dene veya biraz sonra yeniden gönder."
                            if timed_out
                            else "Asistan şu an yanıt veremiyor. Biraz sonra yeniden dene."
                        )
                    }
                },
            )
            return
        except Exception:
            self._send(
                502,
                {"error": {"message": "Asistan şu an yanıt veremiyor. Biraz sonra yeniden dene."}},
            )
            return
        finally:
            release_slot()
        self._send(200, data)


def main():
    def handle(_sig, _frm):
        stop_child()
        raise SystemExit(0)

    signal.signal(signal.SIGTERM, handle)
    signal.signal(signal.SIGINT, handle)
    threading.Thread(target=lambda: ensure("hizli"), daemon=True).start()
    server = ThreadingHTTPServer((LISTEN, PORT), Handler)
    try:
        server.serve_forever()
    finally:
        stop_child()
        server.server_close()


if __name__ == "__main__":
    main()
