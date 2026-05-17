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
import { UserEntity } from '../../../../shared/persistence/entities';

@Entity({ name: 'notifications' })
@Index('IDX_notifications_recipient_created', ['recipientId', 'createdAt'])
@Index('UQ_notifications_recipient_dedup', ['recipientId', 'dedupKey'], {
  unique: true,
  where: '"dedup_key" IS NOT NULL',
})
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'recipient_id', type: 'uuid' })
  recipientId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient!: UserEntity;

  @Column({ type: 'varchar', length: 64 })
  type!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 64 })
  entityType!: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId!: string;

  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId!: string | null;

  @Column({ name: 'dedup_key', type: 'varchar', length: 128, nullable: true })
  dedupKey!: string | null;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
