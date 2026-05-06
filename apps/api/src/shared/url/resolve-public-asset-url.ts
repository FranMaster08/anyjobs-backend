export function resolvePublicAssetUrl(publicBaseUrl: string, candidateUrl: string): string {
  const trimmed = candidateUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const base = publicBaseUrl.trim().replace(/\/+$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}
