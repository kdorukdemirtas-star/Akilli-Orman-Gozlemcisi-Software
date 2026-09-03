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

PORT = os.environ.get("AOG_RX_PORT", "/dev/cu.usbmodem11201")
TX_PORT = os.environ.get("AOG_TX_PORT", "/dev/cu.usbmodem11301")
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
DEMO_LAT = 37.9192
DEMO_LON = 40.268


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


def is_tx_echo(line: str) -> bool:
    """Transmitter USB repeats the AOG payload; RSSI exists only on the RX board."""
    return "gitti" in line


def parse_aog(line: str) -> dict | None:
    m = AOG_RE.search(line)
    if not m:
        return None
    t = num(m.group(2))
    row = {
        "station_id": STATION,
        "n": int(m.group(1)),
        "t": t,
        "gps": 1,
        "lat": DEMO_LAT,
        "lon": DEMO_LON,
        "mq9": int(m.group(6)),
        "a8": int(m.group(7)),
        "a9": int(m.group(8)),
    }
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
        return fds
    bufs = {fd: b"" for fd in fds}
    deadline = time.monotonic() + 0.9
    while time.monotonic() < deadline:
        r, _, _ = select.select(list(fds), [], [], max(0.05, deadline - time.monotonic()))
        for fd in r:
            try:
                chunk = os.read(fd, 1024)
            except (BlockingIOError, OSError):
                continue
            if chunk:
                bufs[fd] += chunk
    for fd, path in list(fds.items()):
        if bufs[fd]:
            continue
        print(f"sessiz {path}, EN reset", flush=True)
        en_pulse(fd)
    leftover = {fd: bufs[fd] for fd in fds}
    return fds, leftover


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
    last_rssi = None
    posted = 0
    pending = None
    try:
        while True:
            opened = open_all_ports()
            fds, leftover = opened
            if not fds:
                print("USB yok, bekleniyor", flush=True)
                time.sleep(2)
                continue
            bufs = {fd: leftover.get(fd, b"") for fd in fds}
            try:
                while True:
                    timeout = 0.2
                    if pending:
                        timeout = max(0.05, pending[0] - time.monotonic())
                    r, _, _ = select.select(list(fds), [], [], timeout)
                    now = time.monotonic()
                    if pending and now >= pending[0]:
                        row = pending[1]
                        pending = None
                        if row["n"] != last_n:
                            if last_rssi is not None and "v" not in row:
                                row["v"] = last_rssi
                            code = post_row(url, anon, row)
                            if code in (200, 201):
                                last_n = row["n"]
                                posted += 1
                                print(
                                    f"yazildi #{posted} n={row['n']} t={row['t']} mq9={row['mq9']} rssi={row.get('v')} a8={row['a8']} a9={row['a9']}",
                                    flush=True,
                                )
                    if r:
                        for fd in r:
                            try:
                                chunk = os.read(fd, 1024)
                            except BlockingIOError:
                                continue
                            except OSError:
                                raise
                            if chunk:
                                bufs[fd] += chunk
                    else:
                        missing = [p for p in fds.values() if not os.path.exists(p)]
                        if missing:
                            raise OSError(6, "Device not configured")
                    for fd, path in fds.items():
                        while b"\n" in bufs[fd]:
                            raw, bufs[fd] = bufs[fd].split(b"\n", 1)
                            line = raw.decode("utf-8", "replace").strip()
                            rssi_m = RSSI_RE.search(line)
                            if rssi_m:
                                last_rssi = int(rssi_m.group(1))
                            row = parse_aog(line)
                            if not row:
                                continue
                            if last_rssi is not None and "v" not in row:
                                row["v"] = last_rssi
                            if is_tx_echo(line):
                                if row["n"] != last_n:
                                    pending = (time.monotonic() + 0.45, row)
                                continue
                            pending = None
                            if row["n"] == last_n:
                                continue
                            code = post_row(url, anon, row)
                            if code in (200, 201):
                                last_n = row["n"]
                                posted += 1
                                print(
                                    f"yazildi #{posted} n={row['n']} t={row['t']} mq9={row['mq9']} rssi={row.get('v')} src={path} a8={row['a8']} a9={row['a9']}",
                                    flush=True,
                                )
            except OSError as e:
                print(f"kopuk {e}, yeniden denenecek", flush=True)
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
