import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class Notifications20260517120000 implements MigrationInterface {
  name = 'Notifications20260517120000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'recipient_id', type: 'uuid' },
          { name: 'type', type: 'varchar', length: '64' },
          { name: 'title', type: 'varchar', length: '255' },
          { name: 'message', type: 'text' },
          { name: 'entity_type', type: 'varchar', length: '64' },
          { name: 'entity_id', type: 'uuid' },
          { name: 'actor_user_id', type: 'uuid', isNullable: true },
          { name: 'dedup_key', type: 'varchar', length: '128', isNullable: true },
          { name: 'is_read', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
        foreignKeys: [
          {
            columnNames: ['recipient_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_notifications_recipient_created',
        columnNames: ['recipient_id', 'created_at'],
      }),
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_notifications_recipient_dedup" ON "notifications" ("recipient_id", "dedup_key") WHERE "dedup_key" IS NOT NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
  }
}
