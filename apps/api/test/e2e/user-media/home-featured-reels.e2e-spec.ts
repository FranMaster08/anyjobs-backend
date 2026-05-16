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
  const unique = Date.now() + Math.floor(Math.random() * 1000);
  const email = `home-featured-${unique}@example.com`;
  const phoneNumber = `+34604${String(unique).slice(-8)}`;

  const registerRes = await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      fullName: 'Home Featured User',
      email,
      phoneNumber,
      password: 'secret123',
      roles: ['CLIENT'],
    })
    .expect(200);

  const cookies = registerRes.headers['set-cookie'];

  await request(app.getHttpServer())
    .post('/auth/verify-email')
    .set('Cookie', cookies)
    .send({ otpCode: '123456' })
    .expect(204);

  await request(app.getHttpServer())
    .patch('/auth/registration/location')
    .set('Cookie', cookies)
    .send({ city: 'Valencia', countryCode: 'ES', area: 'Centro', coverageRadiusKm: 5 })
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

function mediaHeaders(token: string, userId: string) {
  return {
    Authorization: `Bearer ${token}`,
    'x-user-id': userId,
    'x-permissions': 'user-media.upload,user-media.read.own,user-reels.manage.own',
  };
}

describe('Home featured reels (e2e)', () => {
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

  it('GET /home/featured-reels devuelve array vacío sin reels publicados', async () => {
    const res = await request(app.getHttpServer())
      .get('/home/featured-reels')
      .query({ anonymousId: 'anon-home-empty' })
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  it('GET /home/featured-reels incluye reel publicado y respeta limit', async () => {
    const { token, userId } = await registerAndLogin(app);
    const headers = mediaHeaders(token, userId);

    const uploadRes = await request(app.getHttpServer())
      .post('/user-media/assets')
      .set(headers)
      .attach('file', Buffer.from('home-jpeg'), { filename: 'home.jpg', contentType: 'image/jpeg' })
      .expect(201);

    const createRes = await request(app.getHttpServer())
      .post('/user-reels')
      .set(headers)
      .send({ mediaAssetId: uploadRes.body.id })
      .expect(201);

    const reelId = createRes.body.id as string;

    await request(app.getHttpServer())
      .patch(`/user-reels/${reelId}`)
      .set(headers)
      .send({ publish: true })
      .expect(200);

    const homeRes = await request(app.getHttpServer())
      .get('/home/featured-reels')
      .query({ anonymousId: 'anon-home-featured', limit: 15 })
      .expect(200);

    expect(homeRes.body.some((s: { id: string }) => s.id === reelId)).toBe(true);
    expect(homeRes.body.length).toBeLessThanOrEqual(15);

    const limitedRes = await request(app.getHttpServer())
      .get('/home/featured-reels')
      .query({ anonymousId: 'anon-home-featured', limit: 1 })
      .expect(200);

    expect(limitedRes.body).toHaveLength(1);
  });

  it('GET /home/featured-reels no incluye reel en borrador', async () => {
    const { token, userId } = await registerAndLogin(app);
    const headers = mediaHeaders(token, userId);

    const uploadRes = await request(app.getHttpServer())
      .post('/user-media/assets')
      .set(headers)
      .attach('file', Buffer.from('draft-jpeg'), { filename: 'draft.jpg', contentType: 'image/jpeg' })
      .expect(201);

    const createRes = await request(app.getHttpServer())
      .post('/user-reels')
      .set(headers)
      .send({ mediaAssetId: uploadRes.body.id })
      .expect(201);

    const draftId = createRes.body.id as string;

    const homeRes = await request(app.getHttpServer())
      .get('/home/featured-reels')
      .query({ anonymousId: 'anon-home-draft' })
      .expect(200);

    expect(homeRes.body.some((s: { id: string }) => s.id === draftId)).toBe(false);
  });
});
