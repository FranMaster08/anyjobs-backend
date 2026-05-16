import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class OpenRequestInteractions20260516140000 implements MigrationInterface {
  name = 'OpenRequestInteractions20260516140000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'open_request_interactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'kind', type: 'varchar', length: '64' },
          { name: 'open_request_id', type: 'varchar', length: '64' },
          { name: 'route', type: 'varchar', length: '128', isNullable: true },
          { name: 'list_page', type: 'int', isNullable: true },
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
      'open_request_interactions',
      new TableIndex({
        name: 'IDX_open_request_interactions_request_emitted',
        columnNames: ['open_request_id', 'emitted_at'],
      }),
    );
    await queryRunner.createIndex(
      'open_request_interactions',
      new TableIndex({
        name: 'IDX_open_request_interactions_actor',
        columnNames: ['anonymous_id', 'user_id', 'emitted_at'],
      }),
    );
    await queryRunner.createIndex(
      'open_request_interactions',
      new TableIndex({
        name: 'IDX_open_request_interactions_kind',
        columnNames: ['kind', 'open_request_id'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('open_request_interactions', true);
  }
}
