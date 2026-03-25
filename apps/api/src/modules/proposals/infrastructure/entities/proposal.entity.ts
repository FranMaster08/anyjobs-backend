import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OpenRequestEntity } from '../../../open-requests/infrastructure/entities/open-request.entity';
import { UserEntity } from '../../../../shared/persistence/entities';

@Entity({ name: 'proposals' })
export class ProposalEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'request_id', type: 'uuid' })
  requestId!: string;

  @ManyToOne(() => OpenRequestEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request!: OpenRequestEntity;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'author_name', type: 'varchar', length: 200 })
  authorName!: string;

  @Column({ name: 'author_subtitle', type: 'varchar', length: 200 })
  authorSubtitle!: string;

  @Column({ name: 'author_rating', type: 'float', nullable: true })
  authorRating!: number | null;

  @Column({ name: 'author_reviews_count', type: 'int', nullable: true })
  authorReviewsCount!: number | null;

  @Column({ name: 'who_am_i', type: 'varchar', length: 200 })
  whoAmI!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'varchar', length: 200 })
  estimate!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'varchar', length: 16, default: 'SENT' })
  status!: string;
}

