import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
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

  const TEST_USER_IDS = [
    '00000000-0000-0000-0000-000000001001',
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-0000000010aa',
    '00000000-0000-0000-0000-0000000010bb',
    '00000000-0000-0000-0000-0000000010cc',
  ];

  async function seedTestUsers(dataSource: DataSource): Promise<void> {
    for (let i = 0; i < TEST_USER_IDS.length; i++) {
      const id = TEST_USER_IDS[i];
      await dataSource.query(
        `INSERT INTO users (
            id, full_name, email, phone_number, password_hash, roles, status,
            email_verified, phone_verified
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          `Test User ${i + 1}`,
          `e2e-user-${i + 1}@example.com`,
          `+34600${String(i + 1).padStart(6, '0')}`,
          'hash',
          'CLIENT',
          'ACTIVE',
          1,
          1,
        ],
      );
    }
  }

  beforeAll(async () => {
    setTestEnv();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    applyTestAppDefaults(app);
    await app.init();

    const dataSource = app.get(DataSource);
    await seedTestUsers(dataSource);
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
    images: [{ url: 'https://picsum.photos/seed/e2e-open-request/640/360', alt: 'Imagen e2e' }],
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

  it('GET /open-requests/mine without auth returns 401', async () => {
    await request(app.getHttpServer()).get('/open-requests/mine').expect(401);
  });

  it('GET /open-requests/mine returns only own requests, ignores ownerUserId override and respects soft-delete', async () => {
    const ownerId = '00000000-0000-0000-0000-0000000010aa';
    const intruderId = '00000000-0000-0000-0000-0000000010bb';

    const owned1 = await request(app.getHttpServer())
      .post('/open-requests')
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', ownerId)
      .set('x-permissions', 'open-requests.create')
      .send({ ...validCreateBody(), title: 'Mía 1', contactEmail: 'mine1@example.com' })
      .expect(201);

    const owned2 = await request(app.getHttpServer())
      .post('/open-requests')
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', ownerId)
      .set('x-permissions', 'open-requests.create')
      .send({ ...validCreateBody(), title: 'Mía 2', contactEmail: 'mine2@example.com' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/open-requests')
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', intruderId)
      .set('x-permissions', 'open-requests.create')
      .send({ ...validCreateBody(), title: 'Ajena', contactEmail: 'other@example.com' })
      .expect(201);

    const mineRes = await request(app.getHttpServer())
      .get('/open-requests/mine')
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', ownerId)
      .set('x-permissions', 'open-requests.read.own')
      .query({ page: 1, pageSize: 50 })
      .expect(200);

    expect(Array.isArray(mineRes.body.items)).toBe(true);
    const titlesMine = (mineRes.body.items as Array<{ id: string }>).map((x) => x.id);
    expect(titlesMine).toContain(owned1.body.id);
    expect(titlesMine).toContain(owned2.body.id);
    const allOwnedIds = new Set([owned1.body.id, owned2.body.id]);
    expect(titlesMine.every((id) => allOwnedIds.has(id))).toBe(true);

    const overrideRes = await request(app.getHttpServer())
      .get('/open-requests/mine')
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', ownerId)
      .set('x-permissions', 'open-requests.read.own')
      .query({ ownerUserId: intruderId, page: 1, pageSize: 50 })
      .expect(200);

    const idsAfterOverride = (overrideRes.body.items as Array<{ id: string }>).map((x) => x.id);
    expect(idsAfterOverride.every((id) => allOwnedIds.has(id))).toBe(true);

    await request(app.getHttpServer())
      .delete(`/open-requests/${owned1.body.id}`)
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', ownerId)
      .set('x-permissions', 'open-requests.delete')
      .expect(204);

    const afterDeleteRes = await request(app.getHttpServer())
      .get('/open-requests/mine')
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', ownerId)
      .set('x-permissions', 'open-requests.read.own')
      .query({ page: 1, pageSize: 50 })
      .expect(200);

    const idsAfterDelete = (afterDeleteRes.body.items as Array<{ id: string }>).map((x) => x.id);
    expect(idsAfterDelete).not.toContain(owned1.body.id);
    expect(idsAfterDelete).toContain(owned2.body.id);
  });

  it('GET /open-requests/mine returns empty list for user without requests', async () => {
    const lonelyUser = '00000000-0000-0000-0000-0000000010cc';
    const res = await request(app.getHttpServer())
      .get('/open-requests/mine')
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', lonelyUser)
      .set('x-permissions', 'open-requests.read.own')
      .expect(200);

    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(0);
    expect(res.body.meta?.totalItems).toBe(0);
    expect(res.body.hasMore).toBe(false);
  });
});

