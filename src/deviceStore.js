const KEY = "aog-device-v1";

export function readDevice() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) return null;
    if (parsed.device === "ios" || parsed.device === "android" || parsed.device === "web") {
      return parsed.device;
    }
  } catch {
    /* ignore corrupt */
  }
  return null;
}

export function writeDevice(device) {
  localStorage.setItem(KEY, JSON.stringify({ version: 1, device }));
}
