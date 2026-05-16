import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * La migración 20260516140000 creó open_request_id como varchar; open_requests.id es uuid.
 * En Postgres el join `r.id = i.open_request_id` falla con "uuid = character varying".
 */
export class OpenRequestInteractionRequestIdUuid20260516190000 implements MigrationInterface {
  name = 'OpenRequestInteractionRequestIdUuid20260516190000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') return;

    await queryRunner.query(`
      ALTER TABLE open_request_interactions
      ALTER COLUMN open_request_id TYPE uuid USING open_request_id::uuid
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') return;

    await queryRunner.query(`
      ALTER TABLE open_request_interactions
      ALTER COLUMN open_request_id TYPE varchar(64) USING open_request_id::text
    `);
  }
}
