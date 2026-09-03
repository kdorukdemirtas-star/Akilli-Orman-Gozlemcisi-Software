import { useNavigate, useSearchParams } from "react-router-dom";
import { STATION_ID } from "./config.js";
import { parseStation, STATION_STORAGE_KEY } from "./stationPair.js";
import { Shell } from "./SiteNav.jsx";
import "./site.css";

export default function Pair() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const fromQuery = parseStation(params.get("station") || "");
  const fromHref = typeof window === "undefined" ? "" : parseStation(window.location.href);
  const stationId = fromQuery || fromHref || STATION_ID;

  function confirmPair() {
    if (!stationId) return;
    try {
      localStorage.setItem(STATION_STORAGE_KEY, stationId);
    } catch {
      /* private mode */
    }
    navigate("/dashboard", { replace: true });
  }

  return (
    <Shell product="software" footer={false}>
      <section className="lock">
        <h1>Kutuyu eşle</h1>
        <p>İstasyon: {stationId}. Onaylayınca pano bu kutuyu açar.</p>
        <button type="button" className="hit" onClick={confirmPair}>
          Kutuyu eşle
        </button>
      </section>
    </Shell>
  );
}
