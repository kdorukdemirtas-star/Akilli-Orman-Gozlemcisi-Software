// Maps backend error text to copy an operator in the field can act on.
// Setup instructions (schema.sql, .env.local) belong in README.md, not on the board.
export function packetLoadHint(message) {
  const raw = String(message || "");
  if (/schema cache|Could not find the table|PGRST205/i.test(raw)) {
    return "Pano veri tablosuna ulaşamadı. Yeniden dene; sürerse kurulum ekibine haber ver.";
  }
  if (/Failed to fetch|NetworkError|invalid\.supabase/i.test(raw)) {
    return "Sunucuya bağlanılamadı. İnternet bağlantını kontrol edip yeniden dene.";
  }
  return "Paketler okunamadı. Yeniden dene.";
}
