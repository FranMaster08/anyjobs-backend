import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join } from 'node:path';
import { LocalImageStorageProvider } from './local-image-storage.provider';

describe('LocalImageStorageProvider', () => {
  it('saves, resolves and deletes a file', async () => {
    const provider = new LocalImageStorageProvider();
    const saved = await provider.save({
      bytes: Buffer.from('fake-image'),
      mimeType: 'image/jpeg',
      originalName: 'photo.jpg',
    });

    expect(saved.storageKey.endsWith('.jpg')).toBe(true);
    expect(saved.url).toBe(provider.resolveUrl(saved.storageKey));

    const absolute = join(process.cwd(), 'uploads', 'open-request-images', saved.storageKey);
    await expect(access(absolute, constants.F_OK)).resolves.toBeUndefined();

    await provider.delete(saved.storageKey);
    await expect(access(absolute, constants.F_OK)).rejects.toBeTruthy();
  });
});
