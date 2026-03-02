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

describe('Auth (e2e)', () => {
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

  it('register -> verify-email -> verify-phone -> login (happy path)', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        fullName: 'Test User',
        email: 'test@example.com',
        phoneNumber: '+34600111222',
        password: 'secret123',
        roles: ['WORKER'],
      })
      .expect(200);

    expect(registerRes.body).toMatchObject({
      status: 'PENDING',
      nextStage: 'VERIFY',
      emailVerificationRequired: true,
      phoneVerificationRequired: true,
    });
    expect(registerRes.body.userId).toBeTruthy();
    expect(registerRes.headers['set-cookie']).toBeTruthy();

    const cookies = registerRes.headers['set-cookie'];

    await request(app.getHttpServer())
      .post('/auth/verify-email')
      .set('Cookie', cookies)
      .send({ otpCode: '123456' })
      .expect(204);

    await request(app.getHttpServer())
      .post('/auth/verify-phone')
      .set('Cookie', cookies)
      .send({ otpCode: '123456' })
      .expect(204);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'secret123' })
      .expect(200);

    expect(loginRes.body.token).toBeTruthy();
    expect(loginRes.body.user).toMatchObject({
      email: 'test@example.com',
      roles: ['WORKER'],
    });
  });

  it('verify-email without flow cookie returns 401 with error contract', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ otpCode: '123456' })
      .expect(401);

    expect(res.body).toMatchObject({
      status: 401,
      errorCode: 'AUTH.UNAUTHORIZED',
    });
    expect(res.body.correlationId).toBeTruthy();
    expect(res.headers['x-correlation-id']).toBeTruthy();
  });

  it('email-available returns available=false after register', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        fullName: 'Other',
        email: 'used@example.com',
        phoneNumber: '+34600111333',
        password: 'secret123',
        roles: ['CLIENT'],
      })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get('/auth/email-available')
      .query({ email: 'used@example.com' })
      .expect(200);

    expect(res.body).toEqual({ available: false });
  });
});

