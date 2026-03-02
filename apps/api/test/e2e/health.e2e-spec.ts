import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { applyTestAppDefaults } from './test-app';

function setTestEnv() {
  process.env.APP_PORT = process.env.APP_PORT ?? '3001';
  process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? 'error';
  process.env.LOG_DEBUG_PAYLOADS = process.env.LOG_DEBUG_PAYLOADS ?? 'false';
  process.env.PAGINATION_DEFAULT_PAGE_SIZE = process.env.PAGINATION_DEFAULT_PAGE_SIZE ?? '20';
  process.env.PAGINATION_MAX_PAGE_SIZE = process.env.PAGINATION_MAX_PAGE_SIZE ?? '100';
  process.env.SWAGGER_ENABLED = process.env.SWAGGER_ENABLED ?? 'false';
  process.env.SWAGGER_PATH = process.env.SWAGGER_PATH ?? 'docs';
}

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    setTestEnv();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    applyTestAppDefaults(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns ok and correlation header', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
    expect(res.headers['x-correlation-id']).toBeTruthy();
  });

  it('GET /health/secure without auth returns 401 with error contract', async () => {
    const res = await request(app.getHttpServer()).get('/health/secure').expect(401);
    expect(res.body).toMatchObject({
      status: 401,
      errorCode: 'AUTH.UNAUTHORIZED',
    });
    expect(res.body.correlationId).toBeTruthy();
    expect(res.body.timestamp).toBeTruthy();
    expect(res.headers['x-correlation-id']).toBeTruthy();
  });

  it('GET /health/secure with auth but without permission returns 403', async () => {
    const res = await request(app.getHttpServer())
      .get('/health/secure')
      .set('authorization', 'Bearer test-token')
      .expect(403);
    expect(res.body).toMatchObject({
      status: 403,
      errorCode: 'AUTH.FORBIDDEN',
    });
  });

  it('GET /health/secure with required permission returns 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/health/secure')
      .set('authorization', 'Bearer test-token')
      .set('x-permissions', 'health.read')
      .expect(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /health/deny with auth returns 403 (deny-by-default)', async () => {
    const res = await request(app.getHttpServer())
      .get('/health/deny')
      .set('authorization', 'Bearer test-token')
      .expect(403);
    expect(res.body).toMatchObject({
      status: 403,
      errorCode: 'AUTH.FORBIDDEN',
    });
  });
});

