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
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

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
        "ctx": 1024,
        "threads": 3,
        "missing": "Hızlı kip henüz hazır değil. Biraz bekleyip tekrar dene.",
    },
    "derin": {
        "gguf": DERIN_GGUF,
        "port": DERIN_PORT,
        "ctx": 768,
        "threads": 2,
        "missing": "Derin kip henüz hazır değil. Hızlı cevapları dene veya bekleyip tekrar gönder.",
    },
}

NAME_RE = re.compile(r"(?i)qwen[\w.\-]*|deepseek[\w.\-]*|llama[\w.\-]*|\.gguf")
THINK_RE = re.compile(r"<think>[\s\S]*?</think>", re.I)
PATH_RE = re.compile(r"(?i)(?:/home|/opt|/usr|models/)[^\s\"']+")
MAX_BODY = 65536

lock = threading.Lock()
current = ""
child = None


def as_kip(raw):
    return "derin" if str(raw or "").strip().lower() == "derin" else "hizli"


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
        if "content" in msg:
            msg["content"] = scrub(msg.get("content"))
        if "reasoning_content" in msg:
            msg["reasoning_content"] = ""
        choice["message"] = msg
    return data


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        return

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
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
        self._send(404, {"error": {"message": "Yok."}})

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if path != "/v1/chat/completions":
            self._send(404, {"error": {"message": "Yok."}})
            return
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            self._send(400, {"error": {"message": "Gövde JSON değil."}})
            return
        if length < 0 or length > MAX_BODY:
            self._send(400, {"error": {"message": "Gövde JSON değil."}})
            return
        raw = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._send(400, {"error": {"message": "Gövde JSON değil."}})
            return
        if not isinstance(payload, dict):
            self._send(400, {"error": {"message": "Gövde JSON değil."}})
            return
        kip = as_kip(payload.get("model"))
        payload["model"] = kip
        if not os.path.isfile(KIPS[kip]["gguf"]):
            self._send(503, {"error": {"message": KIPS[kip]["missing"]}})
            return
        if not ensure(kip):
            self._send(503, {"error": {"message": KIPS[kip]["missing"]}})
            return
        try:
            data = hide_model(forward(kip, payload), kip)
        except Exception:
            self._send(502, {"error": {"message": "Pi yanıt vermedi. Adres açık mı bak."}})
            return
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
