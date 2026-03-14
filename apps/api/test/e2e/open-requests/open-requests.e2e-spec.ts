import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { applyTestAppDefaults } from '../test-app';

function setTestEnv() {
  process.env.APP_PORT = process.env.APP_PORT ?? '3001';
  process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? 'error';
  process.env.LOG_DEBUG_PAYLOADS = process.env.LOG_DEBUG_PAYLOADS ?? 'false';
  process.env.DB_TYPE = process.env.DB_TYPE ?? 'sqljs';
  process.env.DB_SQLJS_LOCATION = process.env.DB_SQLJS_LOCATION ?? ':memory:';
  process.env.DB_MIGRATIONS_RUN = process.env.DB_MIGRATIONS_RUN ?? 'true';
  process.env.DB_SYNCHRONIZE = process.env.DB_SYNCHRONIZE ?? 'false';
  process.env.DB_LOGGING = process.env.DB_LOGGING ?? 'false';
  process.env.DB_SSL = process.env.DB_SSL ?? 'false';
  process.env.PAGINATION_DEFAULT_PAGE_SIZE = process.env.PAGINATION_DEFAULT_PAGE_SIZE ?? '12';
  process.env.PAGINATION_MAX_PAGE_SIZE = process.env.PAGINATION_MAX_PAGE_SIZE ?? '100';
  process.env.SWAGGER_ENABLED = process.env.SWAGGER_ENABLED ?? 'false';
  process.env.SWAGGER_PATH = process.env.SWAGGER_PATH ?? 'docs';
}

describe('Open Requests (e2e)', () => {
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

  it('GET /open-requests returns paginated list (items+meta) and compat fields', async () => {
    const res = await request(app.getHttpServer())
      .get('/open-requests')
      .query({ page: 1, pageSize: 12 })
      .expect(200);

    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.meta).toMatchObject({
      page: 1,
      pageSize: 12,
    });
    expect(typeof res.body.hasMore).toBe('boolean');
    expect(res.body).toHaveProperty('nextPage');
  });

  it('GET /open-requests/:id returns detail with images array', async () => {
    const listRes = await request(app.getHttpServer())
      .get('/open-requests')
      .query({ page: 1, pageSize: 1 })
      .expect(200);

    const id = listRes.body.items?.[0]?.id;
    expect(id).toBeTruthy();

    const res = await request(app.getHttpServer()).get(`/open-requests/${id}`).expect(200);
    expect(res.body.id).toBe(id);
    expect(Array.isArray(res.body.images)).toBe(true);
  });

  it('GET /open-requests/:id missing returns 404', async () => {
    const res = await request(app.getHttpServer())
      .get('/open-requests/11111111-1111-1111-1111-111111111111')
      .expect(404);
    expect(res.body).toMatchObject({ status: 404, errorCode: 'OPEN_REQUEST.NOT_FOUND' });
  });
});

