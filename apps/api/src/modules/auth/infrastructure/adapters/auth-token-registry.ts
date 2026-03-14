import { Injectable } from '@nestjs/common';

type TokenSession = {
  userId: string;
  roles: string[];
};

@Injectable()
export class AuthTokenRegistry {
  private readonly sessionsByToken = new Map<string, TokenSession>();

  register(token: string, session: TokenSession): void {
    const t = token.trim();
    if (!t) return;
    this.sessionsByToken.set(t, session);
  }

  resolve(token: string): TokenSession | null {
    const t = token.trim();
    if (!t) return null;
    return this.sessionsByToken.get(t) ?? null;
  }
}

