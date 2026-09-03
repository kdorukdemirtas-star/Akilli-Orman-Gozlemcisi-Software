export function parseNtfyFeed(text) {
  const out = [];
  for (const line of String(text || "").split("\n")) {
    const raw = line.trim();
    if (!raw) continue;
    try {
      const row = JSON.parse(raw);
      if (!row || typeof row !== "object") continue;
      if (row.event === "open" || row.event === "keepalive") continue;
      if (!row.message && !row.title) continue;
      out.push(row);
    } catch {
      /* skip junk */
    }
  }
  return out.sort((a, b) => Number(b.time || 0) - Number(a.time || 0));
}

export function ntfyPollUrl(topic) {
  const t = String(topic || "").trim();
  if (!t) return "";
  return `https://ntfy.sh/${encodeURIComponent(t)}/json?poll=1`;
}
