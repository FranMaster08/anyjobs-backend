import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

const PROMO_CAMPAIGNS = [
  {
    id: 'camp-promo-1',
    status: 'scaling',
    priority: 10,
    slide_data: JSON.stringify({
      type: 'image',
      media: 'https://picsum.photos/720/1280',
      user: '@Anyjobs',
      avatar: 'https://i.pravatar.cc/100?img=12',
      caption: 'Descubre oportunidades cerca de ti.',
      music: 'sonido original',
      counts: { like: '1.2K', comment: '48', bookmark: '12' },
    }),
    testing_daily_impression_cap: null,
  },
  {
    id: 'camp-promo-2',
    status: 'testing',
    priority: 5,
    slide_data: JSON.stringify({
      type: 'video',
      media: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      poster: 'https://picsum.photos/seed/promo2/720/1280',
      user: '@Anyjobs',
      avatar: 'https://i.pravatar.cc/100?img=45',
      caption: 'Publicidad — vídeo de ejemplo (mute por defecto).',
      music: 'pista promocional',
      counts: { like: '890' },
    }),
    testing_daily_impression_cap: 500,
  },
];

export class PromoSlidesAnalyticsAndCampaigns20260516120000 implements MigrationInterface {
  name = 'PromoSlidesAnalyticsAndCampaigns20260516120000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'promo_slide_interactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'kind', type: 'varchar', length: '64' },
          { name: 'slider_id', type: 'varchar', length: '64', isNullable: true },
          { name: 'route', type: 'varchar', length: '128', isNullable: true },
          { name: 'slide_index', type: 'int', isNullable: true },
          { name: 'campaign_id', type: 'varchar', length: '64', isNullable: true },
          { name: 'slide_media', type: 'varchar', length: '512', isNullable: true },
          { name: 'subject_type', type: 'varchar', length: '16' },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'anonymous_id', type: 'varchar', length: '64', isNullable: true },
          { name: 'emitted_at', type: 'timestamp' },
          { name: 'payload', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'promo_slide_interactions',
      new TableIndex({
        name: 'IDX_promo_slide_interactions_campaign_emitted',
        columnNames: ['campaign_id', 'emitted_at'],
      }),
    );
    await queryRunner.createIndex(
      'promo_slide_interactions',
      new TableIndex({
        name: 'IDX_promo_slide_interactions_actor',
        columnNames: ['anonymous_id', 'user_id', 'emitted_at'],
      }),
    );
    await queryRunner.createIndex(
      'promo_slide_interactions',
      new TableIndex({
        name: 'IDX_promo_slide_interactions_kind',
        columnNames: ['kind', 'campaign_id'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'promo_campaigns',
        columns: [
          { name: 'id', type: 'varchar', length: '64', isPrimary: true },
          { name: 'status', type: 'varchar', length: '16', default: "'draft'" },
          { name: 'priority', type: 'int', default: 0 },
          { name: 'slide_data', type: 'text' },
          { name: 'testing_daily_impression_cap', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    const driver = queryRunner.connection.driver.options.type;
    for (const row of PROMO_CAMPAIGNS) {
      if (driver === 'postgres') {
        await queryRunner.query(
          `INSERT INTO promo_campaigns (id, status, priority, slide_data, testing_daily_impression_cap)
           VALUES ($1, $2, $3, $4, $5)`,
          [row.id, row.status, row.priority, row.slide_data, row.testing_daily_impression_cap],
        );
      } else {
        await queryRunner.query(
          `INSERT INTO promo_campaigns (id, status, priority, slide_data, testing_daily_impression_cap)
           VALUES (?, ?, ?, ?, ?)`,
          [row.id, row.status, row.priority, row.slide_data, row.testing_daily_impression_cap],
        );
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('promo_slide_interactions', true);
    await queryRunner.dropTable('promo_campaigns', true);
  }
}
