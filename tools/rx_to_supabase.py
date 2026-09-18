#!/usr/bin/env python3
"""USB serial gateway: AOG lines -> packet table."""

from __future__ import annotations

import array
import fcntl
import json
import math
import os
import re
import select
import sys
import termios
import time
import urllib.error
import urllib.request
from pathlib import Path

PORT = os.environ.get("AOG_RX_PORT", "/dev/cu.usbmodem21401")
TX_PORT = os.environ.get("AOG_TX_PORT", "/dev/cu.usbmodem21401")
STATION = os.environ.get("AOG_STATION_ID", "AOG-DEMO-1")
ENV_PATH = Path(
    os.environ.get(
        "AOG_ENV",
        "/Users/dorukdemirtas/Desktop/Akilli-Orman-Gozlemcisi-Software/.env.local",
    )
)

AOG_RE = re.compile(
    r"AOG n=(\d+)\s+t=(\S+)\s+gps=(\d+)"
    r"(?:\s+lat=(\S+)\s+lon=(\S+))?"
    r"(?:\s+nmea=\d+)?"
    r"\s+mq9=(\d+)\s+a8=(\d+)\s+a9=(\d+)"
)
STATUS_RE = re.compile(
    r"t=(\S+)\s+gps=\d+\s+mq9=(\d+)\s+a8=(\d+)\s+a9=(\d+)"
)
FIXED_RSSI = -66
DEMO_LAT = 37.9192
DEMO_LON = 40.268
POST_GAP = 1.0
JUMP_T = 1.5
JUMP_MQ9 = 80
SPIKE_T = 45.0


def load_env(path: Path) -> dict[str, str]:
    out = {}
    if not path.is_file():
        raise SystemExit(f"env yok: {path}")
    for line in path.read_text().splitlines():
        if not line.strip() or line.lstrip().startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def num(s: str | None):
    if s is None:
        return None
    try:
        v = float(s)
    except ValueError:
        return None
    if math.isnan(v) or math.isinf(v):
        return None
    return v


def parse_aog(line: str, fallback_n: int) -> dict | None:
    m = AOG_RE.search(line)
    if m:
        t = num(m.group(2))
        if t is None:
            return None
        return {
            "station_id": STATION,
            "n": int(m.group(1)),
            "t": t,
            "gps": 1,
            "lat": DEMO_LAT,
            "lon": DEMO_LON,
            "mq9": int(m.group(6)),
            "a8": int(m.group(7)),
            "a9": int(m.group(8)),
            "v": FIXED_RSSI,
        }
    s = STATUS_RE.search(line)
    if not s:
        return None
    t = num(s.group(1))
    if t is None:
        return None
    return {
        "station_id": STATION,
        "n": fallback_n,
        "t": t,
        "gps": 1,
        "lat": DEMO_LAT,
        "lon": DEMO_LON,
        "mq9": int(s.group(2)),
        "a8": int(s.group(3)),
        "a9": int(s.group(4)),
        "v": FIXED_RSSI,
    }


def list_usb_modems() -> list[str]:
    if os.path.exists(PORT):
        return [PORT]
    try:
        names = os.listdir("/dev")
    except OSError:
        return []
    out = []
    for n in names:
        low = n.lower()
        if not n.startswith("cu."):
            continue
        if "bluetooth" in low:
            continue
        if any(k in low for k in ("usbmodem", "usbserial", "wchusb", "slab_usbtouart")):
            out.append(f"/dev/{n}")
    return sorted(out)


def open_port(path: str) -> int:
    fd = os.open(path, os.O_RDWR | os.O_NOCTTY | os.O_NONBLOCK)
    iflag, oflag, cflag, lflag, ispeed, ospeed, cc = termios.tcgetattr(fd)
    cc[termios.VMIN] = 0
    cc[termios.VTIME] = 0
    lflag &= ~(termios.ECHO | termios.ICANON | termios.IEXTEN | termios.ISIG)
    iflag &= ~(termios.IXON | termios.IXOFF | termios.IXANY | termios.ICRNL | termios.INLCR)
    oflag &= ~termios.OPOST
    cflag &= ~(termios.CSIZE | termios.PARENB)
    cflag |= termios.CS8 | termios.CREAD | termios.CLOCAL
    if hasattr(termios, "HUPCL"):
        cflag &= ~termios.HUPCL
    ispeed = ospeed = termios.B115200
    termios.tcsetattr(fd, termios.TCSANOW, [iflag, oflag, cflag, lflag, ispeed, ospeed, cc])
    try:
        mods = array.array("i", [0])
        fcntl.ioctl(fd, termios.TIOCMGET, mods)
        dtr = getattr(termios, "TIOCM_DTR", 0x002)
        rts = getattr(termios, "TIOCM_RTS", 0x004)
        mods[0] &= ~(dtr | rts)
        fcntl.ioctl(fd, termios.TIOCMSET, mods)
    except OSError:
        pass
    return fd


def en_pulse(fd: int) -> None:
    """ESP32-S3 USB-JTAG can sit mute until EN is pulsed with IO0 high."""
    dtr = getattr(termios, "TIOCM_DTR", 0x002)
    rts = getattr(termios, "TIOCM_RTS", 0x004)
    try:
        mods = array.array("i", [0])
        fcntl.ioctl(fd, termios.TIOCMGET, mods)
        mods[0] &= ~dtr
        mods[0] |= rts
        fcntl.ioctl(fd, termios.TIOCMSET, mods)
        time.sleep(0.12)
        mods[0] &= ~rts
        fcntl.ioctl(fd, termios.TIOCMSET, mods)
    except OSError:
        pass


def open_all_ports() -> tuple[dict[int, str], dict[int, bytes]]:
    fds: dict[int, str] = {}
    for path in list_usb_modems():
        try:
            fd = open_port(path)
            fds[fd] = path
            print(f"USB {path}", flush=True)
        except OSError as e:
            print(f"acma hatasi {path} {e}", flush=True)
    if not fds:
        return {}, {}
    bufs = {fd: b"" for fd in fds}
    deadline = time.monotonic() + 0.05
    while time.monotonic() < deadline:
        r, _, _ = select.select(list(fds), [], [], max(0.05, deadline - time.monotonic()))
        for fd in r:
            try:
                chunk = os.read(fd, 1024)
            except (BlockingIOError, OSError):
                continue
            if chunk:
                bufs[fd] += chunk
    leftover = {fd: bufs[fd] for fd in fds}
    return fds, leftover


def pump(fds: dict[int, str], bufs: dict[int, bytes], wait: float) -> None:
    timeout = wait
    saw = False
    while True:
        r, _, _ = select.select(list(fds), [], [], timeout)
        if not r:
            if not saw:
                missing = [p for p in fds.values() if not os.path.exists(p)]
                if missing:
                    raise OSError(6, "Device not configured")
            return
        saw = True
        timeout = 0
        got = False
        for fd in r:
            while True:
                try:
                    chunk = os.read(fd, 4096)
                except BlockingIOError:
                    break
                except OSError:
                    raise
                if not chunk:
                    break
                got = True
                bufs[fd] += chunk
        if not got:
            missing = [p for p in fds.values() if not os.path.exists(p)]
            if missing:
                raise OSError(6, "Device not configured")
            return


def newest_row(
    fds: dict[int, str], bufs: dict[int, bytes], fallback_n: int
) -> tuple[dict | None, str | None]:
    latest = None
    src = None
    n = fallback_n
    for fd, path in fds.items():
        while b"\n" in bufs[fd]:
            raw, bufs[fd] = bufs[fd].split(b"\n", 1)
            line = raw.decode("utf-8", "replace").strip()
            row = parse_aog(line, n + 1)
            if not row:
                continue
            row["v"] = FIXED_RSSI
            row["lat"] = DEMO_LAT
            row["lon"] = DEMO_LON
            row["gps"] = 1
            if latest is None or row["n"] >= latest["n"]:
                latest = row
                src = path
            n = row["n"]
    return latest, src


def drop_spike(row: dict, last_t: float | None, spike_n: int) -> tuple[dict | None, int]:
    t = row["t"]
    if last_t is None:
        return row, 0
    if t <= last_t + SPIKE_T:
        return row, 0
    spike_n += 1
    if spike_n >= 2:
        return row, 0
    return None, spike_n


def should_post(
    row: dict,
    last_sig: tuple | None,
    last_post_at: float,
    now: float,
    last_ok: bool,
) -> bool:
    in_gap = bool(last_post_at) and now - last_post_at < POST_GAP
    if in_gap and not last_ok:
        return False
    if not in_gap or last_sig is None:
        return True
    _, last_t, last_mq9, last_a8, last_a9 = last_sig
    if row["a8"] != last_a8 or row["a9"] != last_a9:
        return True
    if abs(row["t"] - last_t) >= JUMP_T:
        return True
    if abs(row["mq9"] - last_mq9) >= JUMP_MQ9:
        return True
    return False


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


_POSTER = urllib.request.build_opener(NoRedirect())


def post_row(url: str, anon: str, row: dict) -> int:
    req = urllib.request.Request(
        f"{url}/rest/v1/packets",
        data=json.dumps(row).encode("utf-8"),
        method="POST",
        headers={
            "apikey": anon,
            "Authorization": f"Bearer {anon}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
    )
    try:
        with _POSTER.open(req, timeout=4) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        with e:
            body = e.read()[:180]
        print(f"HTTP {e.code} {body!r}", flush=True)
        return e.code
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        print(f"post kopuk {e}", flush=True)
        return 0


def main() -> int:
    env = load_env(ENV_PATH)
    url = env.get("VITE_SUPABASE_URL", "").rstrip("/")
    anon = env.get("VITE_SUPABASE_ANON_KEY", "")
    if not url or not anon:
        raise SystemExit("VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY eksik")
    print(f"hedef {url} station={STATION}", flush=True)
    last_n = 0
    last_sig = None
    last_post_at = 0.0
    last_ok = True
    posted = 0
    try:
        while True:
            try:
                opened = open_all_ports()
            except OSError as e:
                print(f"acma {e}, bekleniyor", flush=True)
                time.sleep(2)
                continue
            fds, leftover = opened
            if not fds:
                print("USB yok, bekleniyor", flush=True)
                time.sleep(2)
                continue
            bufs = {fd: leftover.get(fd, b"") for fd in fds}
            pending = None
            pending_path = None
            heard = None
            spike_n = 0
            try:
                while True:
                    pump(fds, bufs, 0.05)
                    row, path = newest_row(fds, bufs, last_n)
                    now = time.monotonic()
                    if row:
                        heard = now
                        last_t = last_sig[1] if last_sig else None
                        row, spike_n = drop_spike(row, last_t, spike_n)
                    if row:
                        pending = row
                        pending_path = path
                    elif heard is not None and now - heard > 8:
                        raise OSError(6, "Device not configured")
                    if not pending:
                        continue
                    if not should_post(pending, last_sig, last_post_at, now, last_ok):
                        continue
                    sig = (
                        pending["n"],
                        pending["t"],
                        pending["mq9"],
                        pending["a8"],
                        pending["a9"],
                    )
                    if sig == last_sig:
                        pending = None
                        continue
                    code = post_row(url, anon, pending)
                    if code in (200, 201):
                        last_n = pending["n"]
                        last_sig = sig
                        last_post_at = time.monotonic()
                        last_ok = True
                        posted += 1
                        print(
                            f"yazildi #{posted} n={pending['n']} t={pending['t']} mq9={pending['mq9']} a8={pending['a8']} a9={pending['a9']} rssi={FIXED_RSSI} src={pending_path}",
                            flush=True,
                        )
                        pending = None
                    else:
                        last_post_at = time.monotonic()
                        last_ok = False
            except OSError as e:
                print(f"kopuk {e}, yeniden denenecek", flush=True)
                time.sleep(1)
            except Exception as e:
                print(f"dongu {type(e).__name__} {e}, yeniden denenecek", flush=True)
                time.sleep(1)
            finally:
                for fd in list(fds):
                    try:
                        os.close(fd)
                    except OSError:
                        pass
    except KeyboardInterrupt:
        print(f"durdu posted={posted}", flush=True)
        return 0


if __name__ == "__main__":
    sys.exit(main())
