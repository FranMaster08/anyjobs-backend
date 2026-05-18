import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const LAT_LNG_TYPE = (process.env.DB_TYPE ?? '').toLowerCase() === 'postgres' ? 'double precision' : 'real';

/** Coordenadas aproximadas de ciudades del seed para mapa nearby en local/e2e. */
const SEED_COORDS: ReadonlyArray<{ id: string; lat: number; lng: number }> = [
  { id: '00000000-0000-0000-0000-000000000101', lat: 41.3874, lng: 2.1686 },
  { id: '00000000-0000-0000-0000-000000000102', lat: 40.4168, lng: -3.7038 },
  { id: '00000000-0000-0000-0000-000000000103', lat: 39.4699, lng: -0.3763 },
  { id: '00000000-0000-0000-0000-000000000104', lat: 41.39, lng: 2.17 },
];

export class OpenRequestsLocationCoords20260517120000 implements MigrationInterface {
  name = 'OpenRequestsLocationCoords20260517120000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('open_requests');
    if (!table) return;

    if (!table.findColumnByName('location_lat')) {
      await queryRunner.addColumn(
        'open_requests',
        new TableColumn({ name: 'location_lat', type: LAT_LNG_TYPE, isNullable: true }),
      );
    }
    if (!table.findColumnByName('location_lng')) {
      await queryRunner.addColumn(
        'open_requests',
        new TableColumn({ name: 'location_lng', type: LAT_LNG_TYPE, isNullable: true }),
      );
    }

    const driver = queryRunner.connection.driver.options.type;
    for (const row of SEED_COORDS) {
      if (driver === 'postgres') {
        await queryRunner.query(
          `UPDATE open_requests SET location_lat = $1, location_lng = $2 WHERE id = $3`,
          [row.lat, row.lng, row.id],
        );
      } else {
        await queryRunner.query(
          `UPDATE open_requests SET location_lat = ?, location_lng = ? WHERE id = ?`,
          [row.lat, row.lng, row.id],
        );
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('open_requests');
    if (!table) return;
    if (table.findColumnByName('location_lng')) {
      await queryRunner.dropColumn('open_requests', 'location_lng');
    }
    if (table.findColumnByName('location_lat')) {
      await queryRunner.dropColumn('open_requests', 'location_lat');
    }
  }
}
