import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { OpenRequestEntity } from './open-request.entity';

const CREATED_AT_COLUMN_TYPE =
  (process.env.DB_TYPE ?? '').toLowerCase() === 'postgres' ? 'timestamp' : 'datetime';

@Entity({ name: 'open_request_images' })
@Index('idx_open_request_images_open_request_id', ['openRequestId'])
@Index('idx_open_request_images_owner_user_id', ['ownerUserId'])
export class OpenRequestImageEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'open_request_id', type: 'uuid' })
  openRequestId!: string;

  @Column({ name: 'owner_user_id', type: 'uuid' })
  ownerUserId!: string;

  @Column({ name: 'storage_key', type: 'varchar', length: 500, nullable: true })
  storageKey!: string | null;

  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @Column({ type: 'varchar', length: 200 })
  alt!: string;

  @CreateDateColumn({ name: 'created_at', type: CREATED_AT_COLUMN_TYPE as any })
  createdAt!: Date;

  @ManyToOne(() => OpenRequestEntity, (openRequest) => openRequest.imageRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'open_request_id' })
  openRequest!: OpenRequestEntity;
}
