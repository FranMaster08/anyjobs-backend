import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAppMeta20260314190000 implements MigrationInterface {
  name = 'CreateAppMeta20260314190000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'app_meta',
        columns: [
          { name: 'key', type: 'varchar', isPrimary: true },
          { name: 'value', type: 'varchar', isNullable: true },
          { name: 'updated_at', type: 'timestamp', isNullable: false, default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('app_meta', true);
  }
}

