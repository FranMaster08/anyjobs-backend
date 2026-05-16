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
  const email = `media-${unique}@example.com`;
  const phoneNumber = `+34602${String(unique).slice(-8)}`;

  const registerRes = await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      fullName: 'Media User',
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
    .send({ city: 'Madrid', countryCode: 'ES', area: 'Centro', coverageRadiusKm: 5 })
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

function authHeaders(token: string, userId: string) {
  return {
    Authorization: `Bearer ${token}`,
    'x-user-id': userId,
    'x-permissions': 'user-media.upload,user-media.read.own,user-reels.manage.own',
  };
}

describe('User media (e2e)', () => {
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

  it('sube asset, crea reel, publica y lista en perfil público', async () => {
    const { token, userId } = await registerAndLogin(app);
    const headers = authHeaders(token, userId);

    const uploadRes = await request(app.getHttpServer())
      .post('/user-media/assets')
      .set(headers)
      .attach('file', Buffer.from('fake-jpeg-bytes'), {
        filename: 'reel.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201);

    expect(uploadRes.body).toMatchObject({
      id: expect.any(String),
      ownerUserId: userId,
      mediaKind: 'image',
      status: 'ready',
    });
    expect(uploadRes.body.mediaUrl).toMatch(/^https?:\/\//);

    const assetId = uploadRes.body.id as string;

    const createReelRes = await request(app.getHttpServer())
      .post('/user-reels')
      .set(headers)
      .send({ mediaAssetId: assetId, caption: 'Mi primer reel' })
      .expect(201);

    expect(createReelRes.body).toMatchObject({
      moderationStatus: 'pending',
      distributionStatus: 'draft',
    });

    const reelId = createReelRes.body.id as string;

    await request(app.getHttpServer())
      .patch(`/user-reels/${reelId}`)
      .set(headers)
      .send({ publish: true })
      .expect(200)
      .expect((res) => {
        expect(res.body.moderationStatus).toBe('approved');
        expect(res.body.distributionStatus).toBe('testing');
        expect(res.body.publishedAt).toBeTruthy();
      });

    const publicList = await request(app.getHttpServer()).get(`/users/${userId}/reels`).expect(200);

    expect(publicList.body.items).toHaveLength(1);
    expect(publicList.body.items[0].caption).toBe('Mi primer reel');
    expect(publicList.body.items[0].media.mediaUrl).toMatch(/^https?:\/\//);
  });

  it('deniega lectura de asset ajeno no publicado', async () => {
    const owner = await registerAndLogin(app);
    const intruder = await registerAndLogin(app);

    const uploadRes = await request(app.getHttpServer())
      .post('/user-media/assets')
      .set(authHeaders(owner.token, owner.userId))
      .attach('file', Buffer.from('owner-only'), {
        filename: 'private.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201);

    const assetId = uploadRes.body.id as string;

    await request(app.getHttpServer())
      .get(`/user-media/assets/${assetId}`)
      .set(authHeaders(intruder.token, intruder.userId))
      .expect(403);
  });
});
