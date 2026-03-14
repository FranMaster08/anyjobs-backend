import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HealthDbProbePort } from '../../application/ports';

@Injectable()
export class TypeOrmHealthDbProbeAdapter implements HealthDbProbePort {
  constructor(private readonly dataSource: DataSource) {}

  async ping(): Promise<void> {
    await this.dataSource.query('SELECT 1');
  }
}

