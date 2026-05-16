/** Valor de `APP_PUBLIC_URL` para devolver rutas relativas (mismo origen que el front con proxy `/uploads`). */
export const RELATIVE_PUBLIC_BASE_URL = 'relative';

export function isRelativePublicBase(publicBaseUrl: string): boolean {
  return publicBaseUrl.trim() === RELATIVE_PUBLIC_BASE_URL;
}

export function resolvePublicAssetUrl(publicBaseUrl: string, candidateUrl: string): string {
  const trimmed = candidateUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (isRelativePublicBase(publicBaseUrl)) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }
  const base = publicBaseUrl.trim().replace(/\/+$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}
