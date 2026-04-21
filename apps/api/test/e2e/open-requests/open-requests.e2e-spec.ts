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

  const demoUserId = '00000000-0000-0000-0000-000000001001';
  const otherUserId = '33333333-3333-3333-3333-333333333333';

  const validCreateBody = () => ({
    title: 'E2E solicitud',
    excerpt: 'Resumen corto.',
    description: 'Descripción completa para la prueba e2e.',
    tags: ['Test'],
    locationLabel: 'Madrid',
    budgetLabel: '€50',
    contactPhone: '+34600000000',
    contactEmail: 'e2e-open-requests@example.com',
  });

  it('POST /open-requests without auth returns 401', async () => {
    await request(app.getHttpServer()).post('/open-requests').send(validCreateBody()).expect(401);
  });

  it('POST /open-requests with wrong permission returns 403', async () => {
    await request(app.getHttpServer())
      .post('/open-requests')
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', demoUserId)
      .set('x-permissions', 'proposals.read')
      .send(validCreateBody())
      .expect(403);
  });

  it('POST /open-requests with permission returns 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/open-requests')
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', demoUserId)
      .set('x-permissions', 'open-requests.create')
      .send(validCreateBody())
      .expect(201);

    expect(res.body.id).toBeTruthy();
    expect(res.body.title).toBe('E2E solicitud');
    expect(Array.isArray(res.body.images)).toBe(true);
  });

  it('PATCH /open-requests/:id as non-owner returns 403', async () => {
    const postRes = await request(app.getHttpServer())
      .post('/open-requests')
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', demoUserId)
      .set('x-permissions', 'open-requests.create')
      .send(validCreateBody())
      .expect(201);

    const id = postRes.body.id as string;

    await request(app.getHttpServer())
      .patch(`/open-requests/${id}`)
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', otherUserId)
      .set('x-permissions', 'open-requests.update')
      .send({ title: 'Robo' })
      .expect(403);
  });

  it('PATCH /open-requests/:id as owner returns 200', async () => {
    const postRes = await request(app.getHttpServer())
      .post('/open-requests')
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', demoUserId)
      .set('x-permissions', 'open-requests.create')
      .send(validCreateBody())
      .expect(201);

    const id = postRes.body.id as string;

    const res = await request(app.getHttpServer())
      .patch(`/open-requests/${id}`)
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', demoUserId)
      .set('x-permissions', 'open-requests.update')
      .send({ title: 'Título actualizado' })
      .expect(200);

    expect(res.body.title).toBe('Título actualizado');
  });

  it('DELETE /open-requests/:id then GET returns 404', async () => {
    const postRes = await request(app.getHttpServer())
      .post('/open-requests')
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', demoUserId)
      .set('x-permissions', 'open-requests.create')
      .send(validCreateBody())
      .expect(201);

    const id = postRes.body.id as string;

    await request(app.getHttpServer())
      .delete(`/open-requests/${id}`)
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', demoUserId)
      .set('x-permissions', 'open-requests.delete')
      .expect(204);

    const getRes = await request(app.getHttpServer()).get(`/open-requests/${id}`).expect(404);
    expect(getRes.body).toMatchObject({ status: 404, errorCode: 'OPEN_REQUEST.NOT_FOUND' });
  });

  it('POST /open-requests invalid payload returns 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/open-requests')
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', demoUserId)
      .set('x-permissions', 'open-requests.create')
      .send({ title: '' })
      .expect(400);

    expect(res.body).toMatchObject({ status: 400, errorCode: 'VALIDATION.INVALID_INPUT' });
  });
});

