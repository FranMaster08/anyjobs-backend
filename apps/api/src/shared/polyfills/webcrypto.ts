import { webcrypto } from 'node:crypto';

if (!(globalThis as unknown as { crypto?: unknown }).crypto) {
  (globalThis as unknown as { crypto: unknown }).crypto = webcrypto as unknown;
}
