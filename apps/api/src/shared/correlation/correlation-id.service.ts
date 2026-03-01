import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

type CorrelationStore = { correlationId: string };

@Injectable()
export class CorrelationIdService {
  private readonly als = new AsyncLocalStorage<CorrelationStore>();

  runWithCorrelationId<T>(correlationId: string, fn: () => T): T {
    return this.als.run({ correlationId }, fn);
  }

  getCorrelationId(): string | undefined {
    return this.als.getStore()?.correlationId;
  }
}

