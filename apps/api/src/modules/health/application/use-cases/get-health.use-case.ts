import { Injectable } from '@nestjs/common';
import type { HealthStatus } from '../../domain/health-status';

export interface GetHealthResult {
  status: HealthStatus;
}

@Injectable()
export class GetHealthUseCase {
  execute(): GetHealthResult {
    return { status: 'ok' };
  }
}

