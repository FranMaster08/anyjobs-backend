export const USER_MEDIA_MAX_BYTES = 50 * 1024 * 1024;

export const USER_MEDIA_ALLOWED_MIMES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export function mediaKindFromMime(mimeType: string): 'image' | 'video' {
  return mimeType.startsWith('video/') ? 'video' : 'image';
}
