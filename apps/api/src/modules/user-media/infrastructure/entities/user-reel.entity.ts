import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MediaAssetEntity } from './media-asset.entity';

const REEL_DATE_COLUMN_TYPE =
  (process.env.DB_TYPE ?? '').toLowerCase() === 'postgres' ? 'timestamp' : 'datetime';

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'hidden';
export type DistributionStatus = 'draft' | 'testing' | 'scaling' | 'paused';

@Entity({ name: 'user_reels' })
@Index('IDX_user_reels_owner', ['ownerUserId', 'createdAt'])
@Index('IDX_user_reels_public', ['ownerUserId', 'moderationStatus', 'distributionStatus'])
export class UserReelEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'owner_user_id', type: 'uuid' })
  ownerUserId!: string;

  @Column({ name: 'media_asset_id', type: 'uuid' })
  mediaAssetId!: string;

  @ManyToOne(() => MediaAssetEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'media_asset_id' })
  mediaAsset?: MediaAssetEntity;

  @Column({ type: 'varchar', length: 500, nullable: true })
  caption!: string | null;

  @Column({ name: 'moderation_status', type: 'varchar', length: 16, default: 'pending' })
  moderationStatus!: ModerationStatus;

  @Column({ name: 'distribution_status', type: 'varchar', length: 16, default: 'draft' })
  distributionStatus!: DistributionStatus;

  @Column({ name: 'published_at', type: REEL_DATE_COLUMN_TYPE, nullable: true })
  publishedAt!: Date | null;

  @Column({ name: 'testing_daily_impression_cap', type: 'int', nullable: true })
  testingDailyImpressionCap!: number | null;

  @Column({ name: 'ranking_score', type: 'float', default: 0 })
  rankingScore!: number;

  @CreateDateColumn({ name: 'created_at', type: REEL_DATE_COLUMN_TYPE })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: REEL_DATE_COLUMN_TYPE })
  updatedAt!: Date;
}
