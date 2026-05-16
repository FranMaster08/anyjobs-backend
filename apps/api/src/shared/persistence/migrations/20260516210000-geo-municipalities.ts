import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class GeoMunicipalities20260516210000 implements MigrationInterface {
  name = 'GeoMunicipalities20260516210000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'geo_municipalities',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'division_id', type: 'uuid' },
          { name: 'name', type: 'varchar', length: '120' },
          { name: 'sort_order', type: 'int', default: 0 },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'geo_municipalities',
      new TableIndex({
        name: 'IDX_geo_municipalities_division_name_unique',
        columnNames: ['division_id', 'name'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'geo_municipalities',
      new TableForeignKey({
        name: 'FK_geo_municipalities_division',
        columnNames: ['division_id'],
        referencedTableName: 'geo_divisions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.query(`DELETE FROM geo_neighborhoods`);

    const neighborhoodTable = await queryRunner.getTable('geo_neighborhoods');
    if (neighborhoodTable?.findColumnByName('division_id')) {
      const divisionFk = neighborhoodTable.foreignKeys.find((fk) => fk.columnNames.includes('division_id'));
      if (divisionFk) await queryRunner.dropForeignKey('geo_neighborhoods', divisionFk);
      await queryRunner.dropColumn('geo_neighborhoods', 'division_id');
    }

    if (!neighborhoodTable?.findColumnByName('municipality_id')) {
      await queryRunner.addColumn(
        'geo_neighborhoods',
        new TableColumn({ name: 'municipality_id', type: 'uuid', isNullable: false }),
      );
    }

    await queryRunner.createForeignKey(
      'geo_neighborhoods',
      new TableForeignKey({
        name: 'FK_geo_neighborhoods_municipality',
        columnNames: ['municipality_id'],
        referencedTableName: 'geo_municipalities',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    const usersTable = await queryRunner.getTable('users');
    if (usersTable && !usersTable.findColumnByName('municipality')) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({ name: 'municipality', type: 'varchar', length: '120', isNullable: true }),
      );
    }

    const flowsTable = await queryRunner.getTable('auth_registration_flows');
    if (flowsTable && !flowsTable.findColumnByName('municipality')) {
      await queryRunner.addColumn(
        'auth_registration_flows',
        new TableColumn({ name: 'municipality', type: 'varchar', length: '120', isNullable: true }),
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const flowsTable = await queryRunner.getTable('auth_registration_flows');
    if (flowsTable?.findColumnByName('municipality')) {
      await queryRunner.dropColumn('auth_registration_flows', 'municipality');
    }
    const usersTable = await queryRunner.getTable('users');
    if (usersTable?.findColumnByName('municipality')) {
      await queryRunner.dropColumn('users', 'municipality');
    }
    await queryRunner.dropTable('geo_municipalities', true);
  }
}
