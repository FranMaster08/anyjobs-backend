import { Injectable } from '@nestjs/common';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { PasswordHasherPort } from '../../application/ports/password-hasher.port';

@Injectable()
export class ScryptPasswordHasher implements PasswordHasherPort {
  async hashPassword(plain: string): Promise<string> {
    const salt = randomBytes(16);
    const derived = scryptSync(plain, salt, 32);
    // formato: scrypt$<salt_b64>$<derived_b64>
    return `scrypt$${salt.toString('base64')}$${derived.toString('base64')}`;
  }

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    const parts = hash.split('$');
    if (parts.length !== 3) return false;
    const [algo, saltB64, derivedB64] = parts;
    if (algo !== 'scrypt') return false;
    const salt = Buffer.from(saltB64, 'base64');
    const expected = Buffer.from(derivedB64, 'base64');
    const actual = scryptSync(plain, salt, expected.length);
    return timingSafeEqual(expected, actual);
  }
}

