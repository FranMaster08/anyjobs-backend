import type { Logger as TypeOrmLogger, QueryRunner } from 'typeorm';
import type { AppLogger } from '../logging/app-logger';

type LogLevel = 'log' | 'info' | 'warn';

export class TypeOrmNestLogger implements TypeOrmLogger {
  constructor(private readonly logger: AppLogger) {}

  logQuery(query: string, parameters?: unknown[], _queryRunner?: QueryRunner) {
    this.logger.debug('DB query', {
      query,
      parametersCount: Array.isArray(parameters) ? parameters.length : 0,
    });
  }

  logQueryError(error: string | Error, query: string, parameters?: unknown[], _queryRunner?: QueryRunner) {
    const err = error instanceof Error ? error : new Error(error);
    this.logger.error('DB query error', err, {
      query,
      parametersCount: Array.isArray(parameters) ? parameters.length : 0,
    });
  }

  logQuerySlow(time: number, query: string, parameters?: unknown[], _queryRunner?: QueryRunner) {
    this.logger.warn('DB slow query', {
      timeMs: time,
      query,
      parametersCount: Array.isArray(parameters) ? parameters.length : 0,
    });
  }

  logSchemaBuild(message: string, _queryRunner?: QueryRunner) {
    this.logger.debug('DB schema build', { message });
  }

  logMigration(message: string, _queryRunner?: QueryRunner) {
    this.logger.log('DB migration', { message });
  }

  log(level: LogLevel, message: unknown, _queryRunner?: QueryRunner) {
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    if (level === 'warn') this.logger.warn('DB warn', { message: msg });
    else this.logger.log('DB log', { message: msg });
  }
}

