import { Injectable } from '@nestjs/common';
import { HealthDbProbePort } from '../ports';

@Injectable()
export class PingDatabaseUseCase {
  constructor(private readonly probe: HealthDbProbePort) {}

  async execute(): Promise<void> {
    await this.probe.ping();
  }
}

