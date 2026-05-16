import { Injectable } from '@nestjs/common';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type {
  SaveUserMediaInput,
  SavedUserMedia,
  UserMediaStoragePort,
} from '../../application/ports/user-media-storage.port';

@Injectable()
export class LocalUserMediaStorageProvider implements UserMediaStoragePort {
  private readonly rootDir = join(process.cwd(), 'uploads', 'user-media');
  private readonly publicBasePath = '/uploads/user-media';

  async save(input: SaveUserMediaInput): Promise<SavedUserMedia> {
    await mkdir(this.rootDir, { recursive: true });
    const ext = this.resolveExtension(input);
    const storageKey = `${randomUUID()}${ext}`;
    const absolutePath = join(this.rootDir, storageKey);
    await writeFile(absolutePath, input.bytes);
    return { storageKey, url: this.resolveUrl(storageKey) };
  }

  async delete(storageKey: string): Promise<void> {
    const absolutePath = join(this.rootDir, storageKey);
    await rm(absolutePath, { force: true });
  }

  resolveUrl(storageKey: string): string {
    return `${this.publicBasePath}/${storageKey}`;
  }

  private resolveExtension(input: SaveUserMediaInput): string {
    const fromName = extname(input.originalName ?? '').toLowerCase();
    if (fromName) return fromName;
    if (input.mimeType === 'video/webm') return '.webm';
    if (input.mimeType === 'video/mp4') return '.mp4';
    if (input.mimeType === 'image/png') return '.png';
    if (input.mimeType === 'image/webp') return '.webp';
    if (input.mimeType === 'image/gif') return '.gif';
    return '.jpg';
  }
}
