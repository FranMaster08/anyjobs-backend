import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

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

  @Column({ type: 'varchar', length: 200 })
  locationLabel!: string;

  @Column({ type: 'varchar', length: 64 })
  publishedAtLabel!: string;

  @Index()
  @Column({ type: 'bigint' })
  publishedAtSort!: string; // stored as string to be portable across drivers

  @Column({ type: 'varchar', length: 64 })
  budgetLabel!: string;

  @Column({ type: 'varchar', length: 500 })
  imageUrl!: string;

  @Column({ type: 'varchar', length: 200 })
  imageAlt!: string;

  @Column({ type: 'simple-json' })
  provider!: { name: string; badge: string; subtitle: string };

  @Column({ type: 'float' })
  reputation!: number;

  @Column({ type: 'int' })
  reviewsCount!: number;

  @Column({ type: 'simple-json' })
  providerReviews!: { author: string; rating: number; dateLabel: string; text: string }[];

  @Column({ type: 'varchar', length: 32 })
  contactPhone!: string;

  @Column({ type: 'varchar', length: 320 })
  contactEmail!: string;

  @Column({ type: 'simple-json' })
  images!: { url: string; alt: string }[];
}

