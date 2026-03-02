export function getCookieValue(cookieHeader: unknown, cookieName: string): string | null {
  if (typeof cookieHeader !== 'string' || cookieHeader.trim().length === 0) return null;

  const parts = cookieHeader.split(';');
  for (const p of parts) {
    const [rawName, ...rest] = p.trim().split('=');
    if (!rawName) continue;
    if (rawName === cookieName) {
      const rawValue = rest.join('=');
      return rawValue ? decodeURIComponent(rawValue) : '';
    }
  }
  return null;
}

