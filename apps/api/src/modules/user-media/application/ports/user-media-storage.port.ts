export interface SaveUserMediaInput {
  bytes: Buffer;
  mimeType: string;
  originalName?: string;
}

export interface SavedUserMedia {
  storageKey: string;
  url: string;
}

export interface UserMediaStoragePort {
  save(input: SaveUserMediaInput): Promise<SavedUserMedia>;
  delete(storageKey: string): Promise<void>;
  resolveUrl(storageKey: string): string;
}
