import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

const PROMO_DATE_COLUMN_TYPE =
  (process.env.DB_TYPE ?? '').toLowerCase() === 'postgres' ? 'timestamp' : 'datetime';

export type PromoCampaignStatus = 'draft' | 'testing' | 'scaling' | 'paused';

@Entity({ name: 'promo_campaigns' })
export class PromoCampaignEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id!: string;

  @Column({ type: 'varchar', length: 16, default: 'draft' })
  status!: PromoCampaignStatus;

  @Column({ type: 'int', default: 0 })
  priority!: number;

  @Column({ name: 'slide_data', type: 'text' })
  slideData!: string;

  @Column({ name: 'testing_daily_impression_cap', type: 'int', nullable: true })
  testingDailyImpressionCap!: number | null;

  @CreateDateColumn({ name: 'created_at', type: PROMO_DATE_COLUMN_TYPE })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: PROMO_DATE_COLUMN_TYPE })
  updatedAt!: Date;
}
