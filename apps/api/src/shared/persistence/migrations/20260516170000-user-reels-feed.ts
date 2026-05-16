import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

const DATE_COLUMN_TYPE =
  (process.env.DB_TYPE ?? '').toLowerCase() === 'postgres' ? 'timestamp' : 'datetime';

export class UserReelsFeed20260516170000 implements MigrationInterface {
  name = 'UserReelsFeed20260516170000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE user_reels ADD COLUMN testing_daily_impression_cap int NULL`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'user_reel_interactions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'kind', type: 'varchar', length: '64' },
          { name: 'slider_id', type: 'varchar', length: '64', isNullable: true },
          { name: 'route', type: 'varchar', length: '128', isNullable: true },
          { name: 'slide_index', type: 'int', isNullable: true },
          { name: 'reel_id', type: 'uuid', isNullable: true },
          { name: 'slide_media', type: 'varchar', length: '512', isNullable: true },
          { name: 'subject_type', type: 'varchar', length: '16' },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'anonymous_id', type: 'varchar', length: '64', isNullable: true },
          { name: 'emitted_at', type: DATE_COLUMN_TYPE },
          { name: 'payload', type: 'text', isNullable: true },
          { name: 'created_at', type: DATE_COLUMN_TYPE, default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'user_reel_interactions',
      new TableIndex({
        name: 'IDX_user_reel_interactions_reel_emitted',
        columnNames: ['reel_id', 'emitted_at'],
      }),
    );

    await queryRunner.createIndex(
      'user_reel_interactions',
      new TableIndex({
        name: 'IDX_user_reel_interactions_actor',
        columnNames: ['anonymous_id', 'user_id', 'emitted_at'],
      }),
    );

    await queryRunner.createForeignKey(
      'user_reel_interactions',
      new TableForeignKey({
        name: 'FK_user_reel_interactions_reel',
        columnNames: ['reel_id'],
        referencedTableName: 'user_reels',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_reel_interactions', true);
    await queryRunner.query(`ALTER TABLE user_reels DROP COLUMN testing_daily_impression_cap`);
  }
}
