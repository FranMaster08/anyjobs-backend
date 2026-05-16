import { resolveUploadMimeType } from './resolve-upload-mime';

describe('resolveUploadMimeType', () => {
  it('accepts video/mp4', () => {
    expect(resolveUploadMimeType('video/mp4', 'clip.mp4')).toBe('video/mp4');
  });

  it('infers mp4 from extension when browser sends octet-stream', () => {
    expect(resolveUploadMimeType('application/octet-stream', 'reel.mp4')).toBe('video/mp4');
  });

  it('infers quicktime from .mov', () => {
    expect(resolveUploadMimeType('', 'video.mov')).toBe('video/quicktime');
  });

  it('rejects unknown extension', () => {
    expect(resolveUploadMimeType('application/octet-stream', 'clip.avi')).toBeNull();
  });
});
