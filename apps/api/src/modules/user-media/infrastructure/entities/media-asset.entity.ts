import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

const MEDIA_DATE_COLUMN_TYPE =
  (process.env.DB_TYPE ?? '').toLowerCase() === 'postgres' ? 'timestamp' : 'datetime';

export type MediaAssetStatus = 'uploading' | 'ready' | 'failed';
export type MediaKind = 'image' | 'video';

@Entity({ name: 'media_assets' })
@Index('IDX_media_assets_owner', ['ownerUserId', 'createdAt'])
export class MediaAssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'owner_user_id', type: 'uuid' })
  ownerUserId!: string;

  @Column({ name: 'storage_key', type: 'varchar', length: 255 })
  storageKey!: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 128 })
  mimeType!: string;

  @Column({ name: 'media_kind', type: 'varchar', length: 16 })
  mediaKind!: MediaKind;

  @Column({ type: 'varchar', length: 16, default: 'ready' })
  status!: MediaAssetStatus;

  @Column({ name: 'file_size_bytes', type: 'int' })
  fileSizeBytes!: number;

  @Column({ type: 'int', nullable: true })
  width!: number | null;

  @Column({ type: 'int', nullable: true })
  height!: number | null;

  @Column({ name: 'duration_ms', type: 'int', nullable: true })
  durationMs!: number | null;

  @CreateDateColumn({ name: 'created_at', type: MEDIA_DATE_COLUMN_TYPE })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: MEDIA_DATE_COLUMN_TYPE })
  updatedAt!: Date;
}
