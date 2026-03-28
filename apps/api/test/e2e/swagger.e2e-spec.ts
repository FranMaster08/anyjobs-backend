import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { setupSwagger } from '../../src/shared/swagger/setup-swagger';
import { applyTestAppDefaults } from './test-app';

function setTestEnv(overrides: Partial<Record<string, string>> = {}) {
  process.env.NODE_ENV = overrides.NODE_ENV ?? 'development';
  process.env.APP_PORT = overrides.APP_PORT ?? '3001';
  process.env.LOG_LEVEL = overrides.LOG_LEVEL ?? 'error';
  process.env.LOG_DEBUG_PAYLOADS = overrides.LOG_DEBUG_PAYLOADS ?? 'false';
  process.env.DB_TYPE = overrides.DB_TYPE ?? 'sqljs';
  process.env.DB_SQLJS_LOCATION = overrides.DB_SQLJS_LOCATION ?? ':memory:';
  process.env.DB_MIGRATIONS_RUN = overrides.DB_MIGRATIONS_RUN ?? 'true';
  process.env.DB_SYNCHRONIZE = overrides.DB_SYNCHRONIZE ?? 'false';
  process.env.DB_LOGGING = overrides.DB_LOGGING ?? 'false';
  process.env.DB_SSL = overrides.DB_SSL ?? 'false';
  process.env.PAGINATION_DEFAULT_PAGE_SIZE = overrides.PAGINATION_DEFAULT_PAGE_SIZE ?? '20';
  process.env.PAGINATION_MAX_PAGE_SIZE = overrides.PAGINATION_MAX_PAGE_SIZE ?? '100';
  process.env.SWAGGER_ENABLED = overrides.SWAGGER_ENABLED ?? 'true';
  process.env.SWAGGER_PATH = overrides.SWAGGER_PATH ?? 'docs';
  process.env.AUTH_SWAGGER_ON = overrides.AUTH_SWAGGER_ON ?? 'true';
}

async function createApp(overrides: Partial<Record<string, string>> = {}): Promise<INestApplication> {
  setTestEnv(overrides);

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  applyTestAppDefaults(app);
  setupSwagger(app, app.get(ConfigService));
  await app.init();
  return app;
}

describe('Swagger (e2e)', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it('documents bearer security and keeps auth UI visible in development when AUTH_SWAGGER_ON=true', async () => {
    app = await createApp({
      NODE_ENV: 'development',
      AUTH_SWAGGER_ON: 'true',
    });

    const jsonRes = await request(app.getHttpServer()).get('/docs-json').expect(200);

    expect(jsonRes.body.components.securitySchemes.bearer).toMatchObject({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    });
    expect(jsonRes.body.paths['/proposals'].get.security).toEqual([{ bearer: [] }]);
    expect(jsonRes.body.paths['/health'].get.security).toBeUndefined();

    const htmlRes = await request(app.getHttpServer()).get('/docs').expect(200);

    expect(htmlRes.text).not.toContain('.scheme-container .auth-wrapper, .opblock .authorization__btn');
  });

  it('keeps bearer documentation but hides auth UI when AUTH_SWAGGER_ON=false', async () => {
    app = await createApp({
      NODE_ENV: 'development',
      AUTH_SWAGGER_ON: 'false',
    });

    const jsonRes = await request(app.getHttpServer()).get('/docs-json').expect(200);

    expect(jsonRes.body.components.securitySchemes.bearer).toMatchObject({
      type: 'http',
      scheme: 'bearer',
    });
    expect(jsonRes.body.paths['/proposals'].post.security).toEqual([{ bearer: [] }]);

    const htmlRes = await request(app.getHttpServer()).get('/docs').expect(200);

    expect(htmlRes.text).toContain(
      '.scheme-container .auth-wrapper, .opblock .authorization__btn { display: none !important; }',
    );
  });

  it('keeps bearer documentation but hides auth UI outside development', async () => {
    app = await createApp({
      NODE_ENV: 'production',
      AUTH_SWAGGER_ON: 'true',
    });

    const jsonRes = await request(app.getHttpServer()).get('/docs-json').expect(200);

    expect(jsonRes.body.paths['/health/secure'].get.security).toEqual([{ bearer: [] }]);

    const htmlRes = await request(app.getHttpServer()).get('/docs').expect(200);

    expect(htmlRes.text).toContain(
      '.scheme-container .auth-wrapper, .opblock .authorization__btn { display: none !important; }',
    );
  });
});
