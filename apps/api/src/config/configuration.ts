import { validateEnv } from './env.validation';

export interface AppConfiguration {
  app: {
    nodeEnv: 'development' | 'test' | 'production';
    port: number;
  };
  seed: {
    demoPassword?: string;
  };
  logging: {
    level: 'debug' | 'log' | 'warn' | 'error';
    debugPayloads: boolean;
  };
  database: {
    type: 'postgres' | 'sqljs';
    ssl: boolean;
    logging: boolean;
    synchronize: boolean;
    migrationsRun: boolean;
    postgres?: {
      host: string;
      port: number;
      username: string;
      password: string;
      database: string;
    };
    sqljs?: {
      location: string;
    };
  };
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
  };
  swagger: {
    enabled: boolean;
    path: string;
    authEnabled: boolean;
  };
}

export const configuration = (): AppConfiguration => {
  const env = validateEnv(process.env);

  const database: AppConfiguration['database'] =
    env.DB_TYPE === 'postgres'
      ? {
          type: 'postgres',
          ssl: env.DB_SSL,
          logging: env.DB_LOGGING,
          synchronize: env.DB_SYNCHRONIZE,
          migrationsRun: env.DB_MIGRATIONS_RUN,
          postgres: {
            host: env.DB_HOST,
            port: env.DB_PORT,
            username: env.DB_USERNAME,
            password: env.DB_PASSWORD,
            database: env.DB_DATABASE,
          },
        }
      : {
          type: 'sqljs',
          ssl: false,
          logging: env.DB_LOGGING,
          synchronize: env.DB_SYNCHRONIZE,
          migrationsRun: env.DB_MIGRATIONS_RUN,
          sqljs: {
            location: env.DB_SQLJS_LOCATION,
          },
        };

  return {
    app: {
      nodeEnv: env.NODE_ENV,
      port: env.APP_PORT,
    },
    seed: {
      demoPassword: env.SEED_DEMO_PASSWORD,
    },
    logging: {
      level: env.LOG_LEVEL,
      debugPayloads: env.LOG_DEBUG_PAYLOADS,
    },
    database,
    pagination: {
      defaultPageSize: env.PAGINATION_DEFAULT_PAGE_SIZE,
      maxPageSize: env.PAGINATION_MAX_PAGE_SIZE,
    },
    swagger: {
      enabled: env.SWAGGER_ENABLED,
      path: env.SWAGGER_PATH,
      authEnabled: env.AUTH_SWAGGER_ON,
    },
  };
};

