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

async function registerAndLogin(app: INestApplication): Promise<{ token: string; userId: string }> {
  const unique = Date.now();
  const email = `profile-${unique}@example.com`;
  const phoneNumber = `+34601${String(unique).slice(-8)}`;

  const registerRes = await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      fullName: 'Profile User',
      email,
      phoneNumber,
      password: 'secret123',
      roles: ['CLIENT'],
    })
    .expect(200);

  const cookies = registerRes.headers['set-cookie'];
  expect(cookies).toBeTruthy();

  await request(app.getHttpServer())
    .post('/auth/verify-email')
    .set('Cookie', cookies)
    .send({ otpCode: '123456' })
    .expect(204);

  await request(app.getHttpServer())
    .patch('/auth/registration/location')
    .set('Cookie', cookies)
    .send({
      city: 'Sevilla',
      countryCode: 'ES',
      area: 'Triana',
      coverageRadiusKm: 8,
    })
    .expect(204);

  await request(app.getHttpServer())
    .post('/auth/registration/complete')
    .set('Cookie', cookies)
    .send({})
    .expect(204);

  const loginRes = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password: 'secret123' })
    .expect(200);

  return { token: loginRes.body.token as string, userId: loginRes.body.user.id as string };
}

describe('User profile read (e2e)', () => {
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

  it('GET /users/me/profile without auth returns 401', async () => {
    await request(app.getHttpServer()).get('/users/me/profile').expect(401);
  });

  it('GET /users/me/profile with Bearer returns private payload with email', async () => {
    const { token, userId } = await registerAndLogin(app);

    const res = await request(app.getHttpServer())
      .get('/users/me/profile')
      .set('authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.userId).toBe(userId);
    expect(res.body.visibility).toBe('private');
    expect(res.body.email).toMatch(/@/);
    expect(res.body.metrics).toBeDefined();
    expect(typeof res.body.metrics.openRequestsPublished).toBe('number');
    expect(typeof res.body.metrics.proposalsSent).toBe('number');
  });

  it('GET /users/profile/:id is public and MUST NOT include email', async () => {
    const { userId } = await registerAndLogin(app);

    const res = await request(app.getHttpServer()).get(`/users/profile/${userId}`).expect(200);

    expect(res.body.visibility).toBe('public');
    expect(res.body.userId).toBe(userId);
    expect(res.body.email).toBeUndefined();
    expect(res.body.phoneNumber).toBeUndefined();
    expect(res.body.metrics).toBeDefined();
  });

  it('GET /users/profile/:id for unknown user returns 404', async () => {
    await request(app.getHttpServer())
      .get('/users/profile/00000000-0000-0000-0000-00000000dead')
      .expect(404);
  });
});
