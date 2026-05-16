import { join } from 'node:path';
import { rm } from 'node:fs/promises';
import { LocalUserMediaStorageProvider } from './local-user-media-storage.provider';

describe('LocalUserMediaStorageProvider', () => {
  const provider = new LocalUserMediaStorageProvider();

  afterEach(async () => {
    await rm(join(process.cwd(), 'uploads', 'user-media'), { recursive: true, force: true });
  });

  it('guarda y resuelve URL pública relativa', async () => {
    const saved = await provider.save({
      bytes: Buffer.from('test'),
      mimeType: 'image/jpeg',
      originalName: 'clip.jpg',
    });

    expect(saved.storageKey).toMatch(/\.jpg$/);
    expect(saved.url).toBe(`/uploads/user-media/${saved.storageKey}`);
    expect(provider.resolveUrl(saved.storageKey)).toBe(saved.url);
  });
});
