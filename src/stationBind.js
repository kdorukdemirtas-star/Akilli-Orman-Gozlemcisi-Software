import { parseStation } from "./stationPair.js";

export function stationFromUser(user) {
  const meta = user?.unsafeMetadata;
  return parseStation(String(meta?.stationId || ""));
}

export async function bindStationToUser(user, raw) {
  const stationId = parseStation(raw);
  if (!user || !stationId) return "";
  await user.update({
    unsafeMetadata: { ...user.unsafeMetadata, stationId },
  });
  return stationId;
}
