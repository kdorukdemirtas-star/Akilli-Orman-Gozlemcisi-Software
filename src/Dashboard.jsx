import { useMemo, useRef, useState } from "react";
import { STATION_ID } from "./config.js";
import { Lookout } from "./Lookout.jsx";
import { QrMark } from "./QrMark.jsx";
import { Shell } from "./SiteNav.jsx";
import { parseStation, pairHref, STATION_STORAGE_KEY } from "./stationPair.js";
import "./site.css";

function readSavedStation() {
  try {
    const saved = parseStation(localStorage.getItem(STATION_STORAGE_KEY) || "");
    if (saved) return saved;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("aog-station:")) continue;
      const migrated = parseStation(localStorage.getItem(key) || "");
      if (migrated) {
        localStorage.setItem(STATION_STORAGE_KEY, migrated);
        return migrated;
      }
    }
  } catch {
    /* private mode */
  }
  return STATION_ID;
}

export default function Dashboard() {
  const [stationId, setStationId] = useState(readSavedStation);
  const [pairDraft, setPairDraft] = useState(readSavedStation);
  const [formErr, setFormErr] = useState("");
  const [formNote, setFormNote] = useState("");
  const qrFile = useRef(null);
  const qrHref = useMemo(() => {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return pairHref(origin, STATION_ID);
  }, []);

  function savePair(e) {
    e.preventDefault();
    const id = parseStation(pairDraft);
    if (!id) {
      setFormErr("Kod 3-40 karakter olmalıdır: harf, sayı, nokta, alt çizgi veya tire.");
      return;
    }
    setFormErr("");
    try {
      localStorage.setItem(STATION_STORAGE_KEY, id);
    } catch {
      /* private mode */
    }
    setStationId(id);
    setPairDraft(id);
    setFormNote(`${id} eşlendi. Pano bu kutunun paketlerini gösteriyor.`);
  }

  async function onQr(e) {
    const input = e.target;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    setFormErr("");
    setFormNote("");
    if (!file.type.startsWith("image/") || file.size > 4 * 1024 * 1024) {
      setFormErr("QR fotoğrafı en fazla 4 MB olmalı ve bir görüntü dosyası olmalıdır.");
      return;
    }
    if (typeof BarcodeDetector === "undefined") {
      setFormErr("Bu tarayıcı QR okumuyor. Kodu elle yaz.");
      return;
    }
    try {
      const bmp = await createImageBitmap(file);
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      const codes = await detector.detect(bmp);
      const parsed = parseStation(codes[0]?.rawValue || "");
      if (parsed) {
        setPairDraft(parsed);
        setFormNote(`QR okundu: ${parsed}. Eşlemek için "Kutuyu eşle"ye bas.`);
      } else {
        setFormErr("QR bulunamadı. Kodu elle yaz.");
      }
    } catch {
      setFormErr("QR okunamadı. Kodu elle yaz.");
    }
  }

  return (
    <Shell product="software" footer={false}>
      <div className="pair-bar">
        <form className="pair" onSubmit={savePair}>
          <label htmlFor="st">İstasyon kodu</label>
          <div className="topic-row">
            <input
              id="st"
              name="station"
              value={pairDraft}
              onChange={(e) => setPairDraft(e.target.value)}
              aria-invalid={formErr ? true : undefined}
              aria-describedby={formErr ? "st-err" : undefined}
            />
            <button className="hit" type="submit">
              Kutuyu eşle
            </button>
            <button
              className="hit ghost"
              type="button"
              onClick={() => qrFile.current?.click()}
            >
              QR fotoğrafından oku
            </button>
            <input
              ref={qrFile}
              className="visually-hidden"
              type="file"
              accept="image/*"
              capture="environment"
              tabIndex={-1}
              aria-hidden="true"
              onChange={onQr}
            />
          </div>
          {formErr ? (
            <p className="err" role="alert" id="st-err">
              {formErr}
            </p>
          ) : null}
          {formNote && !formErr ? <p role="status">{formNote}</p> : null}
        </form>
        <QrMark
          href={qrHref}
          caption={`Kutunun karekodu ${STATION_ID} kodunu yazar. Okutunca pano o istasyonu açar.`}
        />
        <Lookout
          stationId={stationId}
          kicker="Pano"
          lede="Eşlenen kutunun son paketidir. Eşik: 100 °C ve alev."
        />
      </div>
    </Shell>
  );
}
