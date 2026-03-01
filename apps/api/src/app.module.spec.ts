import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';

describe(AppModule.name, () => {
  it('fails fast if required env vars are missing', async () => {
    const prev = { ...process.env };
    try {
      delete process.env.APP_PORT;
      delete process.env.LOG_LEVEL;
      delete process.env.PAGINATION_DEFAULT_PAGE_SIZE;
      delete process.env.PAGINATION_MAX_PAGE_SIZE;

      await expect(
        Test.createTestingModule({
          imports: [AppModule],
        }).compile(),
      ).rejects.toThrow(/Invalid environment variables/i);
    } finally {
      process.env = prev;
    }
  });
});

