import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class GeoDivisionsNeighborhoods20260516200000 implements MigrationInterface {
  name = 'GeoDivisionsNeighborhoods20260516200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'geo_divisions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'country_code', type: 'varchar', length: '2' },
          { name: 'name', type: 'varchar', length: '120' },
          { name: 'division_type', type: 'varchar', length: '20' },
          { name: 'sort_order', type: 'int', default: 0 },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'geo_divisions',
      new TableIndex({
        name: 'IDX_geo_divisions_country_name_unique',
        columnNames: ['country_code', 'name'],
        isUnique: true,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'geo_neighborhoods',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'division_id', type: 'uuid' },
          { name: 'name', type: 'varchar', length: '120' },
          { name: 'sort_order', type: 'int', default: 0 },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'geo_neighborhoods',
      new TableForeignKey({
        name: 'FK_geo_neighborhoods_division',
        columnNames: ['division_id'],
        referencedTableName: 'geo_divisions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'geo_neighborhoods',
      new TableIndex({
        name: 'IDX_geo_neighborhoods_division_name_unique',
        columnNames: ['division_id', 'name'],
        isUnique: true,
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('geo_neighborhoods', true);
    await queryRunner.dropTable('geo_divisions', true);
  }
}
