export interface SaveImageInput {
  bytes: Buffer;
  mimeType: string;
  originalName?: string;
}

export interface SavedImage {
  storageKey: string;
  url: string;
}

export interface ImageStorageProvider {
  save(input: SaveImageInput): Promise<SavedImage>;
  delete(storageKey: string): Promise<void>;
  resolveUrl(storageKey: string): string;
}
