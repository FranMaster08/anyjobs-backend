import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

const OPEN_REQUEST_DATE_COLUMN_TYPE =
  (process.env.DB_TYPE ?? '').toLowerCase() === 'postgres' ? 'timestamp' : 'datetime';

@Entity({ name: 'open_request_interactions' })
@Index('IDX_open_request_interactions_request_emitted', ['openRequestId', 'emittedAt'])
@Index('IDX_open_request_interactions_actor', ['anonymousId', 'userId', 'emittedAt'])
@Index('IDX_open_request_interactions_kind', ['kind', 'openRequestId'])
export class OpenRequestInteractionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  kind!: string;

  @Column({ name: 'open_request_id', type: 'uuid' })
  openRequestId!: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  route!: string | null;

  @Column({ name: 'list_page', type: 'int', nullable: true })
  listPage!: number | null;

  @Column({ name: 'subject_type', type: 'varchar', length: 16 })
  subjectType!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ name: 'anonymous_id', type: 'varchar', length: 64, nullable: true })
  anonymousId!: string | null;

  @Column({ name: 'emitted_at', type: OPEN_REQUEST_DATE_COLUMN_TYPE })
  emittedAt!: Date;

  @Column({ type: 'text', nullable: true })
  payload!: string | null;

  @CreateDateColumn({ name: 'created_at', type: OPEN_REQUEST_DATE_COLUMN_TYPE })
  createdAt!: Date;
}
