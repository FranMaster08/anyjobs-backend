import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { TokenServicePort } from '../../application/ports/token-service.port';

@Injectable()
export class UuidTokenService implements TokenServicePort {
  async issueToken(_subjectUserId: string): Promise<string> {
    // MVP: token opaque (sin claims). Evolución futura: JWT.
    return randomUUID();
  }
}

