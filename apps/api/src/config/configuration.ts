import { validateEnv } from './env.validation';

export interface AppConfiguration {
  app: {
    nodeEnv: 'development' | 'test' | 'production';
    port: number;
  };
  logging: {
    level: 'debug' | 'log' | 'warn' | 'error';
    debugPayloads: boolean;
  };
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
  };
  swagger: {
    enabled: boolean;
    path: string;
  };
}

export const configuration = (): AppConfiguration => {
  const env = validateEnv(process.env);

  return {
    app: {
      nodeEnv: env.NODE_ENV,
      port: env.APP_PORT,
    },
    logging: {
      level: env.LOG_LEVEL,
      debugPayloads: env.LOG_DEBUG_PAYLOADS,
    },
    pagination: {
      defaultPageSize: env.PAGINATION_DEFAULT_PAGE_SIZE,
      maxPageSize: env.PAGINATION_MAX_PAGE_SIZE,
    },
    swagger: {
      enabled: env.SWAGGER_ENABLED,
      path: env.SWAGGER_PATH,
    },
  };
};

