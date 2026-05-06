import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

const CREATED_AT_COLUMN_TYPE =
  (process.env.DB_TYPE ?? '').toLowerCase() === 'postgres' ? 'timestamp' : 'datetime';

export class OpenRequestImages20260506100000 implements MigrationInterface {
  name = 'OpenRequestImages20260506100000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.hasTable('open_request_images');
    if (!exists) {
      await queryRunner.createTable(
        new Table({
          name: 'open_request_images',
          columns: [
            { name: 'id', type: 'uuid', isPrimary: true },
            { name: 'open_request_id', type: 'uuid', isNullable: false },
            { name: 'owner_user_id', type: 'uuid', isNullable: false },
            { name: 'storage_key', type: 'varchar', length: '500', isNullable: true },
            { name: 'url', type: 'varchar', length: '500', isNullable: false },
            { name: 'alt', type: 'varchar', length: '200', isNullable: false },
            { name: 'created_at', type: CREATED_AT_COLUMN_TYPE, default: 'CURRENT_TIMESTAMP' },
          ],
        }),
      );
    }

    const table = await queryRunner.getTable('open_request_images');
    if (!table) return;

    if (!table.indices.some((idx) => idx.name === 'idx_open_request_images_open_request_id')) {
      await queryRunner.createIndex(
        'open_request_images',
        new TableIndex({
          name: 'idx_open_request_images_open_request_id',
          columnNames: ['open_request_id'],
        }),
      );
    }

    if (!table.indices.some((idx) => idx.name === 'idx_open_request_images_owner_user_id')) {
      await queryRunner.createIndex(
        'open_request_images',
        new TableIndex({
          name: 'idx_open_request_images_owner_user_id',
          columnNames: ['owner_user_id'],
        }),
      );
    }

    const tableAfterIndex = await queryRunner.getTable('open_request_images');
    if (!tableAfterIndex) return;

    const hasOpenRequestFk = tableAfterIndex.foreignKeys.some((fk) => fk.columnNames.includes('open_request_id'));
    if (!hasOpenRequestFk) {
      await queryRunner.createForeignKey(
        'open_request_images',
        new TableForeignKey({
          columnNames: ['open_request_id'],
          referencedTableName: 'open_requests',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    const refreshed = await queryRunner.getTable('open_request_images');
    if (!refreshed) return;
    const hasOwnerFk = refreshed.foreignKeys.some((fk) => fk.columnNames.includes('owner_user_id'));
    if (!hasOwnerFk) {
      await queryRunner.createForeignKey(
        'open_request_images',
        new TableForeignKey({
          columnNames: ['owner_user_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('open_request_images');
    if (!table) return;

    for (const fk of table.foreignKeys) {
      await queryRunner.dropForeignKey('open_request_images', fk);
    }
    for (const idx of table.indices) {
      await queryRunner.dropIndex('open_request_images', idx);
    }
    await queryRunner.dropTable('open_request_images');
  }
}
