import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

const DATE_COLUMN_TYPE =
  (process.env.DB_TYPE ?? '').toLowerCase() === 'postgres' ? 'timestamp' : 'datetime';

export class UserMediaContent20260516160000 implements MigrationInterface {
  name = 'UserMediaContent20260516160000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'media_assets',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'owner_user_id', type: 'uuid' },
          { name: 'storage_key', type: 'varchar', length: '255' },
          { name: 'mime_type', type: 'varchar', length: '128' },
          { name: 'media_kind', type: 'varchar', length: '16' },
          { name: 'status', type: 'varchar', length: '16', default: "'ready'" },
          { name: 'file_size_bytes', type: 'int' },
          { name: 'width', type: 'int', isNullable: true },
          { name: 'height', type: 'int', isNullable: true },
          { name: 'duration_ms', type: 'int', isNullable: true },
          { name: 'created_at', type: DATE_COLUMN_TYPE, default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: DATE_COLUMN_TYPE, default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'media_assets',
      new TableIndex({
        name: 'IDX_media_assets_owner',
        columnNames: ['owner_user_id', 'created_at'],
      }),
    );

    await queryRunner.createForeignKey(
      'media_assets',
      new TableForeignKey({
        name: 'FK_media_assets_owner_user',
        columnNames: ['owner_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'user_reels',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'owner_user_id', type: 'uuid' },
          { name: 'media_asset_id', type: 'uuid' },
          { name: 'caption', type: 'varchar', length: '500', isNullable: true },
          { name: 'moderation_status', type: 'varchar', length: '16', default: "'pending'" },
          { name: 'distribution_status', type: 'varchar', length: '16', default: "'draft'" },
          { name: 'published_at', type: DATE_COLUMN_TYPE, isNullable: true },
          { name: 'created_at', type: DATE_COLUMN_TYPE, default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: DATE_COLUMN_TYPE, default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'user_reels',
      new TableIndex({
        name: 'IDX_user_reels_owner',
        columnNames: ['owner_user_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'user_reels',
      new TableIndex({
        name: 'IDX_user_reels_public',
        columnNames: ['owner_user_id', 'moderation_status', 'distribution_status'],
      }),
    );

    await queryRunner.createForeignKey(
      'user_reels',
      new TableForeignKey({
        name: 'FK_user_reels_owner_user',
        columnNames: ['owner_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_reels',
      new TableForeignKey({
        name: 'FK_user_reels_media_asset',
        columnNames: ['media_asset_id'],
        referencedTableName: 'media_assets',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_reels', true);
    await queryRunner.dropTable('media_assets', true);
  }
}
