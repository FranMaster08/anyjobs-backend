import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Tras borrados manuales en user_reels, las filas huérfanas en user_reel_interactions
 * impiden nuevos INSERT con el mismo reel_id. Se anulan referencias inválidas.
 */
export class SanitizeOrphanReelInteractions20260516220000 implements MigrationInterface {
  name = 'SanitizeOrphanReelInteractions20260516220000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE user_reel_interactions i
      SET reel_id = NULL
      WHERE i.reel_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM user_reels r WHERE r.id = i.reel_id)
    `);
  }

  async down(): Promise<void> {
    // No reversible: no se puede restaurar reel_id sin conocer el valor anterior.
  }
}
