import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserReelsRankingScore20260516180000 implements MigrationInterface {
  name = 'UserReelsRankingScore20260516180000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE user_reels ADD COLUMN ranking_score float NOT NULL DEFAULT 0`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user_reels DROP COLUMN ranking_score`);
  }
}
