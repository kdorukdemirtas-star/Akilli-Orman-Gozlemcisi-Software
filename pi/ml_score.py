#!/usr/bin/env python3
"""Fit a scaled LogReg on station packets and write P(y=1).

Label is the locked AND rule: t >= 100 and flame (a8 or a9 is 0).
Does not publish ntfy; the PWA kip decides whether the score is used.
"""

from __future__ import annotations

import json
import math
import os
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from pathlib import Path

ENV_PATH = Path(os.environ.get("AOG_ENV", "/home/demir/aog-pi/.env"))
STATION = os.environ.get("AOG_STATION_ID", "AOG-DEMO-1")
MODEL_PATH = Path(os.environ.get("AOG_ML_MODEL", "/home/demir/aog-pi/logreg.joblib"))
WINDOW = 400
MIN_ROWS = 20
MIN_PER_CLASS = 3


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


def write_score(url: str, key: str, latest: dict, score: float, model: str) -> None:
    rest(
        url,
        key,
        "scores",
        method="POST",
        body={
            "station_id": STATION,
            "n": latest.get("n"),
            "score": round(float(score), 4),
            "model": model,
        },
    )


def main() -> int:
    from joblib import dump
    from sklearn.linear_model import LogisticRegression
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler

    env = load_env(ENV_PATH)
    url = (env.get("VITE_SUPABASE_URL") or "").rstrip("/")
    key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("VITE_SUPABASE_ANON_KEY") or ""
    if not url or not key:
        raise SystemExit("Paket tablosu URL / anahtar eksik")
    rows = rest(
        url,
        key,
        "packets",
        params={
            "station_id": f"eq.{STATION}",
            "select": "id,n,t,mq9,a8,a9,v,rssi,created_at",
            "order": "created_at.desc",
            "limit": str(WINDOW),
        },
    )
    if not isinstance(rows, list) or len(rows) < MIN_ROWS:
        n = 0 if not isinstance(rows, list) else len(rows)
        print(f"az paket ({n}), skor yok", flush=True)
        return 0
    X = [feats(r) for r in rows]
    y = [label_of(r) for r in rows]
    counts = Counter(y)
    latest = rows[0]
    if len(counts) < 2 or min(counts.values()) < MIN_PER_CLASS:
        print(
            f"sinif yetmez pos={counts.get(1, 0)} neg={counts.get(0, 0)}, skor 0",
            flush=True,
        )
        write_score(url, key, latest, 0.0, "logreg-wait")
        return 0
    pipe = Pipeline(
        [
            ("scale", StandardScaler()),
            (
                "clf",
                LogisticRegression(
                    class_weight="balanced",
                    max_iter=400,
                    solver="lbfgs",
                ),
            ),
        ]
    )
    pipe.fit(X, y)
    dump(pipe, MODEL_PATH)
    proba = float(pipe.predict_proba([feats(latest)])[0][1])
    write_score(url, key, latest, proba, "logreg")
    print(
        f"skor {proba:.3f} n={latest.get('n')} pos={counts[1]} neg={counts[0]} {MODEL_PATH}",
        flush=True,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
