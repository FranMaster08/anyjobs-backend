import { validateEnv } from './env.validation';

describe('env.validation', () => {
  it('throws when required env vars are missing', () => {
    expect(() =>
      validateEnv({
        // Missing APP_PORT, LOG_LEVEL, PAGINATION_DEFAULT_PAGE_SIZE, PAGINATION_MAX_PAGE_SIZE
      } as unknown as NodeJS.ProcessEnv),
    ).toThrow(/Invalid environment variables/i);
  });

  it('parses booleans from string env vars', () => {
    const env = validateEnv({
      APP_PORT: '3000',
      LOG_LEVEL: 'log',
      LOG_DEBUG_PAYLOADS: 'false',
      PAGINATION_DEFAULT_PAGE_SIZE: '20',
      PAGINATION_MAX_PAGE_SIZE: '100',
      SWAGGER_ENABLED: 'false',
      DB_TYPE: 'postgres',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USERNAME: 'postgres',
      DB_PASSWORD: 'postgres',
      DB_DATABASE: 'anyjobs',
      DB_SSL: 'false',
      DB_LOGGING: 'false',
      DB_SYNCHRONIZE: 'false',
      DB_MIGRATIONS_RUN: 'false',
    } as unknown as NodeJS.ProcessEnv);

    expect(env.LOG_DEBUG_PAYLOADS).toBe(false);
    expect(env.SWAGGER_ENABLED).toBe(false);
    expect(env.DB_SSL).toBe(false);
    expect(env.DB_LOGGING).toBe(false);
    expect(env.DB_SYNCHRONIZE).toBe(false);
    expect(env.DB_MIGRATIONS_RUN).toBe(false);
  });
});

