import { MigrationInterface, QueryRunner } from 'typeorm';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000001001';
const OPEN_REQUEST_IDS = [
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000102',
];

/**
 * Asigna creador demo a las solicitudes sembradas por la migración inicial cuando `owner_user_id` quedó null.
 * Idempotente: solo actualiza filas con owner nulo.
 */
export class SeedOpenRequestsOwnerDemo20260514120000 implements MigrationInterface {
  name = 'SeedOpenRequestsOwnerDemo20260514120000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver.options.type;
    const userExists =
      driver === 'postgres'
        ? await queryRunner.query(`SELECT 1 FROM users WHERE id = $1 LIMIT 1`, [DEMO_USER_ID])
        : await queryRunner.query(`SELECT 1 FROM users WHERE id = ? LIMIT 1`, [DEMO_USER_ID]);
    if (!userExists?.length) {
      // En Docker local el seed crea el usuario demo después de migration:run.
      return;
    }

    for (const id of OPEN_REQUEST_IDS) {
      if (driver === 'postgres') {
        await queryRunner.query(
          `UPDATE open_requests SET owner_user_id = $1 WHERE id = $2 AND owner_user_id IS NULL`,
          [DEMO_USER_ID, id],
        );
      } else {
        await queryRunner.query(
          `UPDATE open_requests SET owner_user_id = ? WHERE id = ? AND owner_user_id IS NULL`,
          [DEMO_USER_ID, id],
        );
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver.options.type;
    for (const id of OPEN_REQUEST_IDS) {
      if (driver === 'postgres') {
        await queryRunner.query(
          `UPDATE open_requests SET owner_user_id = NULL WHERE id = $1 AND owner_user_id = $2`,
          [id, DEMO_USER_ID],
        );
      } else {
        await queryRunner.query(
          `UPDATE open_requests SET owner_user_id = NULL WHERE id = ? AND owner_user_id = ?`,
          [id, DEMO_USER_ID],
        );
      }
    }
  }
}
