import { USER_MEDIA_ALLOWED_MIMES } from './user-media-constants';

const EXTENSION_MIME: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  m4v: 'video/x-m4v',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

/** Acepta MIME del cliente o lo infiere por extensión (p. ej. `application/octet-stream` + `.mp4`). */
export function resolveUploadMimeType(mimeType: string, originalName?: string): string | null {
  const normalized = mimeType?.trim().toLowerCase();
  if (normalized && USER_MEDIA_ALLOWED_MIMES.has(normalized)) {
    return normalized;
  }
  const ext = originalName?.split('.').pop()?.toLowerCase() ?? '';
  const fromExt = EXTENSION_MIME[ext];
  if (fromExt && USER_MEDIA_ALLOWED_MIMES.has(fromExt)) {
    return fromExt;
  }
  return null;
}
