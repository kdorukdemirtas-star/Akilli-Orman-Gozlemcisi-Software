#!/usr/bin/env python3
"""USB serial gateway: AOG alici -> Supabase packets.

Reads LoRa lines from the RX Deneyap, posts AOG-DEMO-1 rows.
Keeps GPS TX/RX on the transmitter; this process only opens the RX port.
"""

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

PORT = os.environ.get("AOG_RX_PORT", "/dev/cu.usbmodem11301")
TX_PORT = os.environ.get("AOG_TX_PORT", "/dev/cu.usbmodem11201")
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
RSSI_RE = re.compile(r"(?:^|\s)rssi=(-?\d+)")


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


def parse_aog(line: str) -> dict | None:
    m = AOG_RE.search(line)
    if not m:
        return None
    t = num(m.group(2))
    lat = num(m.group(4))
    lon = num(m.group(5))
    row = {
        "station_id": STATION,
        "n": int(m.group(1)),
        "t": t,
        "gps": int(m.group(3)),
        "mq9": int(m.group(6)),
        "a8": int(m.group(7)),
        "a9": int(m.group(8)),
    }
    if lat is not None:
        row["lat"] = lat
    if lon is not None:
        row["lon"] = lon
    rssi = RSSI_RE.search(line)
    if rssi:
        # `v` already exists on the live table; rssi column may not.
        row["v"] = int(rssi.group(1))
    return row


def list_usb_modems() -> list[str]:
    try:
        names = os.listdir("/dev")
    except OSError:
        return []
    return sorted(f"/dev/{n}" for n in names if n.startswith("cu.usbmodem"))


def find_rx_port() -> str | None:
    wanted = PORT
    if os.path.exists(wanted):
        return wanted
    others = [p for p in list_usb_modems() if p != TX_PORT]
    return others[0] if others else None


def wait_for_rx_port() -> str:
    while True:
        path = find_rx_port()
        if path:
            return path
        print("alici USB yok, bekleniyor", flush=True)
        time.sleep(2)


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
        with urllib.request.urlopen(req, timeout=12) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        body = e.read()[:180]
        print(f"HTTP {e.code} {body!r}", flush=True)
        return e.code


def main() -> int:
    env = load_env(ENV_PATH)
    url = env.get("VITE_SUPABASE_URL", "").rstrip("/")
    anon = env.get("VITE_SUPABASE_ANON_KEY", "")
    if not url or not anon:
        raise SystemExit("VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY eksik")
    print(f"hedef {url} station={STATION}", flush=True)
    last_n = None
    posted = 0
    try:
        while True:
            path = wait_for_rx_port()
            print(f"RX {path}", flush=True)
            try:
                fd = open_port(path)
            except OSError as e:
                print(f"acma hatasi {e}", flush=True)
                time.sleep(2)
                continue
            buf = b""
            try:
                while True:
                    r, _, _ = select.select([fd], [], [], 1.0)
                    if not r:
                        if not os.path.exists(path):
                            raise OSError(6, "Device not configured")
                        continue
                    try:
                        chunk = os.read(fd, 1024)
                    except BlockingIOError:
                        continue
                    except OSError:
                        raise
                    if not chunk:
                        time.sleep(0.05)
                        continue
                    buf += chunk
                    while b"\n" in buf:
                        raw, buf = buf.split(b"\n", 1)
                        line = raw.decode("utf-8", "replace").strip()
                        row = parse_aog(line)
                        if not row:
                            continue
                        if row["n"] == last_n:
                            continue
                        last_n = row["n"]
                        code = post_row(url, anon, row)
                        if code in (200, 201):
                            posted += 1
                            print(
                                f"yazildi #{posted} n={row['n']} t={row['t']} mq9={row['mq9']} rssi={row.get('v')} a8={row['a8']} a9={row['a9']}",
                                flush=True,
                            )
            except OSError as e:
                print(f"kopuk {e}, yeniden denenecek", flush=True)
                time.sleep(1)
            finally:
                try:
                    os.close(fd)
                except OSError:
                    pass
    except KeyboardInterrupt:
        print(f"durdu posted={posted}", flush=True)
        return 0


if __name__ == "__main__":
    sys.exit(main())
