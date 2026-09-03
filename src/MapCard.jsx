import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function hasCoords(lat, lon) {
  const la = Number(lat);
  const lo = Number(lon);
  return Number.isFinite(la) && Number.isFinite(lo) && Math.abs(la) > 0.1 && Math.abs(lo) > 0.1;
}

export default function MapCard({ lat, lon, gps, title = "Harita", heading = true }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapBox = useRef(null);
  const placed = hasCoords(lat, lon);

  useEffect(() => {
    const el = mapBox.current;
    if (!el) return undefined;
    if (el._leaflet_id) {
      try {
        mapRef.current?.remove();
      } catch {
        /* already gone */
      }
      el._leaflet_id = undefined;
    }
    const map = L.map(el, { scrollWheelZoom: false });
    const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    });
    tiles.createTile = function createTile(coords, done) {
      const tile = document.createElement("img");
      L.DomEvent.on(tile, "load", L.Util.bind(this._tileOnLoad, this, done, tile));
      L.DomEvent.on(tile, "error", L.Util.bind(this._tileOnError, this, done, tile));
      tile.referrerPolicy = "origin";
      tile.alt = "";
      tile.src = this.getTileUrl(coords);
      return tile;
    };
    tiles.addTo(map);
    map.setView([41.0, 29.0], 6);
    mapRef.current = map;
    const fit = () => map.invalidateSize({ animate: false });
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    map.whenReady(fit);
    const t = window.setTimeout(fit, 80);
    const t2 = window.setTimeout(fit, 400);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.invalidateSize();
    if (!hasCoords(lat, lon)) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      map.setView([41.0, 29.0], 6);
      return;
    }
    const la = Number(lat);
    const lo = Number(lon);
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
    map.invalidateSize({ animate: false });
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
      ) : Number(gps) === 1 ? null : (
        <p className="ops-empty">Koordinat pakette, uydu kilidi bitinde değil.</p>
      )}
    </section>
  );
}
