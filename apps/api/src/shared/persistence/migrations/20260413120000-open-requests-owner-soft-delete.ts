import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class OpenRequestsOwnerSoftDelete20260413120000 implements MigrationInterface {
  name = 'OpenRequestsOwnerSoftDelete20260413120000';

  async up(queryRunner: QueryRunner): Promise<void> {
    let table = await queryRunner.getTable('open_requests');
    if (!table) return;

    if (!table.findColumnByName('owner_user_id')) {
      await queryRunner.addColumn(
        'open_requests',
        new TableColumn({ name: 'owner_user_id', type: 'uuid', isNullable: true }),
      );
    }

    table = await queryRunner.getTable('open_requests');
    if (!table?.findColumnByName('deleted_at')) {
      await queryRunner.addColumn(
        'open_requests',
        new TableColumn({ name: 'deleted_at', type: 'timestamp', isNullable: true }),
      );
    }

    const refreshed = await queryRunner.getTable('open_requests');
    const hasFk = refreshed?.foreignKeys.some((fk) => fk.columnNames.includes('owner_user_id'));
    if (!hasFk && refreshed?.findColumnByName('owner_user_id')) {
      await queryRunner.createForeignKey(
        'open_requests',
        new TableForeignKey({
          columnNames: ['owner_user_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('open_requests');
    if (!table) return;

    const fk = table.foreignKeys.find((x) => x.columnNames.includes('owner_user_id'));
    if (fk) await queryRunner.dropForeignKey('open_requests', fk);

    if (table.findColumnByName('deleted_at')) {
      await queryRunner.dropColumn('open_requests', 'deleted_at');
    }
    if (table.findColumnByName('owner_user_id')) {
      await queryRunner.dropColumn('open_requests', 'owner_user_id');
    }
  }
}
