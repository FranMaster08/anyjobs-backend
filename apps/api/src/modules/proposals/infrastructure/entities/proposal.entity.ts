import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'proposals' })
export class ProposalEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  requestId!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 200 })
  authorName!: string;

  @Column({ type: 'varchar', length: 200 })
  authorSubtitle!: string;

  @Column({ type: 'float', nullable: true })
  authorRating!: number | null;

  @Column({ type: 'int', nullable: true })
  authorReviewsCount!: number | null;

  @Column({ type: 'varchar', length: 200 })
  whoAmI!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'varchar', length: 200 })
  estimate!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'varchar', length: 16, default: 'SENT' })
  status!: string;
}

