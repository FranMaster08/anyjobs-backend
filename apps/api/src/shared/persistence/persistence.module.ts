import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { CorrelationIdService } from '../correlation/correlation-id.service';
import { createAppLogger } from '../logging/app-logger';
import type { AppConfiguration } from '../../config/configuration';
import { buildDataSourceOptions, resolveTypeOrmLogging } from './typeorm.options';
import { TypeOrmNestLogger } from './typeorm-nest.logger';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService, CorrelationIdService],
      useFactory: (configService: ConfigService<AppConfiguration>, correlationIdService: CorrelationIdService) => {
        const database = configService.getOrThrow<AppConfiguration['database']>('database');
        const debugPayloads = configService.getOrThrow<AppConfiguration['logging']>('logging').debugPayloads;

        const logger = new TypeOrmNestLogger(createAppLogger('TypeORM', correlationIdService, debugPayloads));
        const logging = resolveTypeOrmLogging(database, debugPayloads);

        return {
          ...buildDataSourceOptions(database, { logger, logging }),
          autoLoadEntities: true,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class PersistenceModule {}

