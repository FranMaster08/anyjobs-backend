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
  process.env.PAGINATION_DEFAULT_PAGE_SIZE = process.env.PAGINATION_DEFAULT_PAGE_SIZE ?? '20';
  process.env.PAGINATION_MAX_PAGE_SIZE = process.env.PAGINATION_MAX_PAGE_SIZE ?? '100';
  process.env.SWAGGER_ENABLED = process.env.SWAGGER_ENABLED ?? 'false';
  process.env.SWAGGER_PATH = process.env.SWAGGER_PATH ?? 'docs';
}

describe('Proposals (e2e)', () => {
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

  it('GET /proposals without auth returns 401', async () => {
    await request(app.getHttpServer()).get('/proposals').expect(401);
  });

  it('GET /proposals with auth but without permission returns 403', async () => {
    await request(app.getHttpServer()).get('/proposals').set('authorization', 'Bearer test-token').expect(403);
  });

  it('POST /proposals with permission returns 201', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        fullName: 'Proposer',
        email: 'proposer@example.com',
        phoneNumber: '+34600999111',
        password: 'secret123',
        roles: ['WORKER'],
      })
      .expect(200);

    const userId = registerRes.body.userId;

    const openRequestsRes = await request(app.getHttpServer())
      .get('/open-requests')
      .query({ page: 1, pageSize: 1 })
      .expect(200);
    const requestId = openRequestsRes.body.items?.[0]?.id;
    expect(requestId).toBeTruthy();

    const res = await request(app.getHttpServer())
      .post('/proposals')
      .set('authorization', 'Bearer test-token')
      .set('x-permissions', 'proposals.create')
      .send({
        requestId,
        userId,
        authorName: 'María',
        authorSubtitle: 'Profesional',
        whoAmI: 'Soy profesional.',
        message: 'Puedo hacerlo.',
        estimate: '€60',
      })
      .expect(201);

    expect(res.body).toMatchObject({ requestId, userId, status: 'SENT' });
    expect(res.body.id).toBeTruthy();
    expect(res.body.createdAt).toBeTruthy();
  });

  it('POST /proposals invalid payload returns 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/proposals')
      .set('authorization', 'Bearer test-token')
      .set('x-permissions', 'proposals.create')
      .send({ requestId: '00000000-0000-0000-0000-000000000101' })
      .expect(400);

    expect(res.body).toMatchObject({ status: 400, errorCode: 'VALIDATION.INVALID_INPUT' });
  });
});

