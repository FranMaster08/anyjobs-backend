import { Column, DeleteDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

const OPEN_REQUEST_DELETED_AT_TYPE =
  (process.env.DB_TYPE ?? '').toLowerCase() === 'postgres' ? 'timestamp' : 'datetime';

@Entity({ name: 'open_requests' })
export class OpenRequestEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 400 })
  excerpt!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'simple-array' })
  tags!: string[];

  @Column({ name: 'location_label', type: 'varchar', length: 200 })
  locationLabel!: string;

  @Column({ name: 'published_at_label', type: 'varchar', length: 64 })
  publishedAtLabel!: string;

  @Index()
  @Column({ name: 'published_at_sort', type: 'bigint' })
  publishedAtSort!: string; // stored as string to be portable across drivers

  @Column({ name: 'budget_label', type: 'varchar', length: 64 })
  budgetLabel!: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500 })
  imageUrl!: string;

  @Column({ name: 'image_alt', type: 'varchar', length: 200 })
  imageAlt!: string;

  @Column({ type: 'simple-json' })
  provider!: { name: string; badge: string; subtitle: string };

  @Column({ type: 'float' })
  reputation!: number;

  @Column({ name: 'reviews_count', type: 'int' })
  reviewsCount!: number;

  @Column({ name: 'provider_reviews', type: 'simple-json' })
  providerReviews!: { author: string; rating: number; dateLabel: string; text: string }[];

  @Column({ name: 'contact_phone', type: 'varchar', length: 32 })
  contactPhone!: string;

  @Column({ name: 'contact_email', type: 'varchar', length: 320 })
  contactEmail!: string;

  @Column({ type: 'simple-json' })
  images!: { url: string; alt: string }[];

  @Column({ name: 'owner_user_id', type: 'uuid', nullable: true })
  ownerUserId!: string | null;

  @DeleteDateColumn({ name: 'deleted_at', type: OPEN_REQUEST_DELETED_AT_TYPE as any, nullable: true })
  deletedAt?: Date | null;
}

