/** Public map pin. Packet GPS is never shown on the board. */
export const DISPLAY_PIN = {
  lat: 37.9192,
  lon: 40.268,
  gps: 1,
  note: "Dicle Üniversitesi",
  zoom: 15,
};

export function withDisplayPin(p) {
  if (!DISPLAY_PIN) return p;
  return {
    ...(p && typeof p === "object" ? p : {}),
    lat: DISPLAY_PIN.lat,
    lon: DISPLAY_PIN.lon,
    gps: DISPLAY_PIN.gps,
  };
}
