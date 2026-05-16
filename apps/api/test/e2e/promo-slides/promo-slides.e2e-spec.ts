import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { applyTestAppDefaults } from '../test-app';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoSlideInteractionEntity } from '../../../src/modules/promo-slides/infrastructure/entities/promo-slide-interaction.entity';

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

describe('Promo Slides (e2e)', () => {
  let app: INestApplication;
  let interactionsRepo: Repository<PromoSlideInteractionEntity>;

  beforeAll(async () => {
    setTestEnv();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    applyTestAppDefaults(app);
    await app.init();

    interactionsRepo = moduleRef.get(getRepositoryToken(PromoSlideInteractionEntity));
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /promo-slides/interactions acepta slideAction con userRoles, active y count', async () => {
    await request(app.getHttpServer())
      .post('/promo-slides/interactions')
      .send({
        kind: 'slideAction',
        sliderId: 'home-promotional',
        route: '/home',
        slideIndex: 0,
        campaignId: 'camp-promo-1',
        subjectType: 'user',
        userId: '00000000-0000-0000-0000-000000001001',
        userRoles: ['worker'],
        anonymousId: 'anon-e2e-2',
        emittedAt: new Date().toISOString(),
        action: 'like',
        active: true,
        count: '1.3K',
      })
      .expect(204);
  });

  it('POST /promo-slides/interactions persiste el evento', async () => {
    await request(app.getHttpServer())
      .post('/promo-slides/interactions')
      .send({
        kind: 'slideImpression',
        sliderId: 'home-promotional',
        route: '/home',
        slideIndex: 0,
        campaignId: 'camp-promo-1',
        slideMedia: 'https://picsum.photos/720/1280',
        subjectType: 'anonymous',
        userId: null,
        anonymousId: 'anon-e2e-1',
        emittedAt: new Date().toISOString(),
      })
      .expect(204);

    const rows = await interactionsRepo.find({
      where: { anonymousId: 'anon-e2e-1', kind: 'slideImpression' },
    });
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].campaignId).toBe('camp-promo-1');
  });

  it('GET /promo-slides devuelve campañas activas con id', async () => {
    const res = await request(app.getHttpServer()).get('/promo-slides').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toMatchObject({ id: expect.any(String), media: expect.any(String) });
  });

  it('GET /promo-slides/metrics requiere permiso', async () => {
    await request(app.getHttpServer()).get('/promo-slides/metrics').expect(401);
  });

  it('GET /promo-slides/metrics con permiso devuelve agregados', async () => {
    await request(app.getHttpServer())
      .post('/promo-slides/interactions')
      .send({
        kind: 'watchProgress',
        campaignId: 'camp-promo-1',
        subjectType: 'anonymous',
        anonymousId: 'anon-metrics',
        emittedAt: new Date().toISOString(),
        watchMs: 8000,
        completionRate: 0.95,
      })
      .expect(204);

    const res = await request(app.getHttpServer())
      .get('/promo-slides/metrics')
      .set('authorization', 'Bearer test-token')
      .set('x-user-id', '00000000-0000-0000-0000-000000001001')
      .set('x-permissions', 'promo-slides.metrics.read')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const camp = res.body.find((m: { campaignId: string }) => m.campaignId === 'camp-promo-1');
    expect(camp).toBeDefined();
  });
});
