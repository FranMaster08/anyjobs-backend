import { validateEnv } from './env.validation';

describe('env.validation', () => {
  it('throws when required env vars are missing', () => {
    expect(() =>
      validateEnv({
        // Missing APP_PORT, LOG_LEVEL, PAGINATION_DEFAULT_PAGE_SIZE, PAGINATION_MAX_PAGE_SIZE
      } as unknown as NodeJS.ProcessEnv),
    ).toThrow(/Invalid environment variables/i);
  });
});

