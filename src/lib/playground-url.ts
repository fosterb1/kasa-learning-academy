/** Shared, strict URL guard for administrator-entered iframe destinations. */
export function normalizePlaygroundUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:' || url.username || url.password ||
        url.search || url.hash || url.pathname !== '/' || !url.hostname.includes('.')) {
      return null
    }
    return url.origin + '/'
  } catch {
    return null
  }
}
