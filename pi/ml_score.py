#!/usr/bin/env python3
"""Train sklearn LogReg on packets and write scores.

Label is the locked demo rule: t >= 100 and flame (a8 or a9 is 0).
Features: t, mq9, a8, a9, rssi/v. Does not decide ntfy by itself.
"""

from __future__ import annotations

import json
import math
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ENV_PATH = Path(os.environ.get("AOG_ENV", "/home/demir/aog-pi/.env"))
STATION = os.environ.get("AOG_STATION_ID", "AOG-DEMO-1")
MODEL_PATH = Path(os.environ.get("AOG_ML_MODEL", "/home/demir/aog-pi/logreg.joblib"))


def load_env(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.is_file():
        raise SystemExit(f"env yok: {path}")
    for line in path.read_text().splitlines():
        if not line.strip() or line.lstrip().startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def flame(row: dict) -> bool:
    return int(row.get("a8") or 1) == 0 or int(row.get("a9") or 1) == 0


def label_of(row: dict) -> int:
    t = row.get("t")
    try:
        temp = float(t)
    except (TypeError, ValueError):
        return 0
    return 1 if temp >= 100 and flame(row) else 0


def feats(row: dict) -> list[float]:
    def num(key, default=0.0):
        try:
            v = float(row.get(key))
        except (TypeError, ValueError):
            return default
        if math.isnan(v) or math.isinf(v):
            return default
        return v

    rssi = row.get("rssi")
    if rssi is None:
        rssi = row.get("v")
    try:
        rssi_n = float(rssi)
    except (TypeError, ValueError):
        rssi_n = 0.0
    if math.isnan(rssi_n) or math.isinf(rssi_n):
        rssi_n = 0.0
    return [num("t"), num("mq9"), num("a8", 1), num("a9", 1), rssi_n]


def rest(url: str, key: str, path: str, method="GET", body=None, params=None) -> object:
    q = f"?{urllib.parse.urlencode(params)}" if params else ""
    req = urllib.request.Request(
        f"{url}/rest/v1/{path}{q}",
        data=None if body is None else json.dumps(body).encode("utf-8"),
        method=method,
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read()
            return json.loads(raw.decode("utf-8") or "null")
    except urllib.error.HTTPError as e:
        err = e.read()[:200]
        raise SystemExit(f"HTTP {e.code} {err!r}") from e


def main() -> int:
    from joblib import dump
    from sklearn.linear_model import LogisticRegression

    env = load_env(ENV_PATH)
    url = (env.get("VITE_SUPABASE_URL") or "").rstrip("/")
    key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("VITE_SUPABASE_ANON_KEY") or ""
    if not url or not key:
        raise SystemExit("Supabase URL / anahtar eksik")
    rows = rest(
        url,
        key,
        "packets",
        params={
            "station_id": f"eq.{STATION}",
            "select": "id,n,t,mq9,a8,a9,v,rssi,created_at",
            "order": "created_at.desc",
            "limit": "400",
        },
    )
    if not isinstance(rows, list) or len(rows) < 20:
        print(f"az paket ({0 if not isinstance(rows, list) else len(rows)}), skor yok", flush=True)
        return 0
    X = [feats(r) for r in rows]
    y = [label_of(r) for r in rows]
    if len(set(y)) < 2:
        print("tek sinif: etiketler henuz 100C+alev yok, skor 0", flush=True)
        latest = rows[0]
        rest(
            url,
            key,
            "scores",
            method="POST",
            body={
                "station_id": STATION,
                "n": latest.get("n"),
                "score": 0.0,
                "model": "logreg-wait",
            },
        )
        return 0
    clf = LogisticRegression(max_iter=200)
    clf.fit(X, y)
    dump(clf, MODEL_PATH)
    latest = rows[0]
    proba = float(clf.predict_proba([feats(latest)])[0][1])
    rest(
        url,
        key,
        "scores",
        method="POST",
        body={
            "station_id": STATION,
            "n": latest.get("n"),
            "score": round(proba, 4),
            "model": "logreg",
        },
    )
    print(f"skor {proba:.3f} n={latest.get('n')} model={MODEL_PATH}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
