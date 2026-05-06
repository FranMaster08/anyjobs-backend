import { Injectable } from '@nestjs/common';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { ImageStorageProvider, SaveImageInput, SavedImage } from '../../application/ports/image-storage-provider.port';

@Injectable()
export class LocalImageStorageProvider implements ImageStorageProvider {
  private readonly rootDir = join(process.cwd(), 'uploads', 'open-request-images');
  private readonly publicBasePath = '/uploads/open-request-images';

  async save(input: SaveImageInput): Promise<SavedImage> {
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

  private resolveExtension(input: SaveImageInput): string {
    const fromName = extname(input.originalName ?? '').toLowerCase();
    if (fromName) return fromName;
    if (input.mimeType === 'image/png') return '.png';
    if (input.mimeType === 'image/webp') return '.webp';
    if (input.mimeType === 'image/gif') return '.gif';
    return '.jpg';
  }
}
