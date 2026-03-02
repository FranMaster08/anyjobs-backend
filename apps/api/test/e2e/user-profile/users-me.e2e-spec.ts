import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { applyTestAppDefaults } from '../test-app';

function setTestEnv() {
  process.env.APP_PORT = process.env.APP_PORT ?? '3001';
  process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? 'error';
  process.env.LOG_DEBUG_PAYLOADS = process.env.LOG_DEBUG_PAYLOADS ?? 'false';
  process.env.PAGINATION_DEFAULT_PAGE_SIZE = process.env.PAGINATION_DEFAULT_PAGE_SIZE ?? '20';
  process.env.PAGINATION_MAX_PAGE_SIZE = process.env.PAGINATION_MAX_PAGE_SIZE ?? '100';
  process.env.SWAGGER_ENABLED = process.env.SWAGGER_ENABLED ?? 'false';
  process.env.SWAGGER_PATH = process.env.SWAGGER_PATH ?? 'docs';
}

describe('Users /me (e2e)', () => {
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

  it('PATCH /users/me/location without auth returns 401', async () => {
    await request(app.getHttpServer())
      .patch('/users/me/location')
      .send({ city: 'Barcelona' })
      .expect(401);
  });

  it('PATCH /users/me/location with auth but without permission returns 403', async () => {
    await request(app.getHttpServer())
      .patch('/users/me/location')
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', 'u1')
      .send({ city: 'Barcelona' })
      .expect(403);
  });

  it('PATCH /users/me/location with auth+permission returns 204', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        fullName: 'User',
        email: 'me@example.com',
        phoneNumber: '+34600111444',
        password: 'secret123',
        roles: ['WORKER'],
      })
      .expect(200);

    const userId = registerRes.body.userId;

    await request(app.getHttpServer())
      .patch('/users/me/location')
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', userId)
      .set('x-permissions', 'users.me.write')
      .send({ city: 'Barcelona', area: 'Eixample' })
      .expect(204);
  });

  it('PATCH /users/me/worker-profile with auth+permission returns 204', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        fullName: 'Worker',
        email: 'worker@example.com',
        phoneNumber: '+34600111555',
        password: 'secret123',
        roles: ['WORKER'],
      })
      .expect(200);

    const userId = registerRes.body.userId;

    await request(app.getHttpServer())
      .patch('/users/me/worker-profile')
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', userId)
      .set('x-permissions', 'users.me.write')
      .set('x-roles', 'WORKER')
      .send({ categories: ['Limpieza'], headline: 'h' })
      .expect(204);
  });
});

