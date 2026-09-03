import { useEffect, useRef } from "react";
import L from "leaflet";

function hasFix(gps) {
  const g = Number(gps);
  return g === 1 || g === 2;
}

export default function MapCard({ lat, lon, gps, title = "Harita", heading = true }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapBox = useRef(null);
  const placed = hasFix(gps);

  useEffect(() => {
    const el = mapBox.current;
    if (!el) return undefined;
    const map = L.map(el, { scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    map.setView([41.0, 29.0], 6);
    mapRef.current = map;
    const raf = requestAnimationFrame(() => map.invalidateSize());
    return () => {
      cancelAnimationFrame(raf);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!hasFix(gps)) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }
    const la = Number(lat);
    const lo = Number(lon);
    if (Number.isNaN(la) || Number.isNaN(lo)) return;
    if (!markerRef.current) {
      markerRef.current = L.circleMarker([la, lo], {
        radius: 8,
        color: "#6b3f24",
        fillColor: "#9fbf8a",
        fillOpacity: 0.95,
        weight: 2,
      }).addTo(map);
    } else {
      markerRef.current.setLatLng([la, lo]);
    }
    map.setView([la, lo], 13);
  }, [lat, lon, gps]);

  return (
    <section className="map-card">
      {heading ? <p className="kicker">{title}</p> : null}
      <div
        ref={mapBox}
        className="map"
        role="region"
        aria-label="İstasyon haritası"
      />
      {!placed ? (
        <p className="ops-empty">GPS fix yok. Harita Türkiye genel bakışındadır.</p>
      ) : Number(gps) === 2 ? (
        <p className="ops-empty">Son kayıtlı konum. Uydu kilidi yok.</p>
      ) : null}
    </section>
  );
}
