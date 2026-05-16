import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

const INTERACTION_DATE_COLUMN_TYPE =
  (process.env.DB_TYPE ?? '').toLowerCase() === 'postgres' ? 'timestamp' : 'datetime';

@Entity({ name: 'user_reel_interactions' })
@Index('IDX_user_reel_interactions_reel_emitted', ['reelId', 'emittedAt'])
@Index('IDX_user_reel_interactions_actor', ['anonymousId', 'userId', 'emittedAt'])
export class UserReelInteractionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  kind!: string;

  @Column({ name: 'slider_id', type: 'varchar', length: 64, nullable: true })
  sliderId!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  route!: string | null;

  @Column({ name: 'slide_index', type: 'int', nullable: true })
  slideIndex!: number | null;

  @Column({ name: 'reel_id', type: 'uuid', nullable: true })
  reelId!: string | null;

  @Column({ name: 'slide_media', type: 'varchar', length: 512, nullable: true })
  slideMedia!: string | null;

  @Column({ name: 'subject_type', type: 'varchar', length: 16 })
  subjectType!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ name: 'anonymous_id', type: 'varchar', length: 64, nullable: true })
  anonymousId!: string | null;

  @Column({ name: 'emitted_at', type: INTERACTION_DATE_COLUMN_TYPE })
  emittedAt!: Date;

  @Column({ type: 'text', nullable: true })
  payload!: string | null;

  @CreateDateColumn({ name: 'created_at', type: INTERACTION_DATE_COLUMN_TYPE })
  createdAt!: Date;
}
