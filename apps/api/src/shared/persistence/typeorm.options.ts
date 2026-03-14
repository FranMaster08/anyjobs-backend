import { join } from 'node:path';
import type { DataSourceOptions, LoggerOptions } from 'typeorm';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import type { SqljsConnectionOptions } from 'typeorm/driver/sqljs/SqljsConnectionOptions';
import type { AppConfiguration } from '../../config/configuration';

type DatabaseConfig = AppConfiguration['database'];

export function resolveTypeOrmLogging(database: DatabaseConfig, debugPayloads: boolean): LoggerOptions {
  if (!database.logging) return false;
  return debugPayloads ? ['query', 'error', 'warn', 'schema', 'migration'] : ['error', 'warn', 'schema', 'migration'];
}

export function buildDataSourceOptions(
  database: DatabaseConfig,
  overrides?: Pick<DataSourceOptions, 'logger' | 'logging'>,
): DataSourceOptions {
  const entities = [
    join(__dirname, '../../modules/**/infrastructure/**/*.entity{.ts,.js}'),
    join(__dirname, './entities/**/*.entity{.ts,.js}'),
  ];
  const migrations = [join(__dirname, './migrations/*{.ts,.js}')];

  const base: Pick<DataSourceOptions, 'entities' | 'migrations' | 'synchronize' | 'migrationsRun' | 'logging' | 'logger'> = {
    entities,
    migrations,
    synchronize: database.synchronize,
    migrationsRun: database.migrationsRun,
    logging: overrides?.logging ?? false,
    logger: overrides?.logger,
  };

  if (database.type === 'postgres') {
    if (!database.postgres) throw new Error('Invalid database config: postgres details missing');
    const opts: PostgresConnectionOptions = {
      type: 'postgres',
      host: database.postgres.host,
      port: database.postgres.port,
      username: database.postgres.username,
      password: database.postgres.password,
      database: database.postgres.database,
      ssl: database.ssl ? { rejectUnauthorized: false } : false,
      ...base,
    };
    return opts;
  }

  if (!database.sqljs) throw new Error('Invalid database config: sqljs details missing');
  const opts: SqljsConnectionOptions = {
    type: 'sqljs',
    location: database.sqljs.location,
    autoSave: false,
    ...base,
  };
  return opts;
}

