import { Module } from '@nestjs/common';
import { HealthController } from './api/controllers/health.controller';
import { GetHealthUseCase } from './application/use-cases/get-health.use-case';
import { HealthDbProbePort } from './application/ports';
import { TypeOrmHealthDbProbeAdapter } from './infrastructure/adapters/typeorm-health-db-probe.adapter';
import { PingDatabaseUseCase } from './application/use-cases/ping-database.use-case';

@Module({
  controllers: [HealthController],
  providers: [
    GetHealthUseCase,
    PingDatabaseUseCase,
    TypeOrmHealthDbProbeAdapter,
    {
      provide: HealthDbProbePort,
      useExisting: TypeOrmHealthDbProbeAdapter,
    },
  ],
})
export class HealthModule {}

