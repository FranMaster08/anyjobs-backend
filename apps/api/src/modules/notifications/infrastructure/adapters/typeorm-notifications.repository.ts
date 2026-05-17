import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { buildPageMeta } from '../../../../shared/application/pagination/page-result';
import type { PageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import type { CreateNotificationInput, Notification } from '../../domain';
import type { NotificationsRepositoryPort } from '../../application/ports/notifications-repository.port';
import { NotificationEntity } from '../entities/notification.entity';

function toDomain(e: NotificationEntity): Notification {
  return {
    id: e.id,
    recipientId: e.recipientId,
    type: e.type as Notification['type'],
    title: e.title,
    message: e.message,
    entityType: e.entityType as Notification['entityType'],
    entityId: e.entityId,
    actorUserId: e.actorUserId ?? undefined,
    dedupKey: e.dedupKey ?? undefined,
    isRead: e.isRead,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

@Injectable()
export class TypeOrmNotificationsRepository implements NotificationsRepositoryPort {
  constructor(@InjectRepository(NotificationEntity) private readonly repo: Repository<NotificationEntity>) {}

  async create(input: CreateNotificationInput): Promise<Notification | null> {
    const entity = this.repo.create({
      recipientId: input.recipientId,
      type: input.type,
      title: input.title,
      message: input.message,
      entityType: input.entityType,
      entityId: input.entityId,
      actorUserId: input.actorUserId ?? null,
      dedupKey: input.dedupKey ?? null,
      isRead: false,
    });
    try {
      const saved = await this.repo.save(entity);
      return toDomain(saved);
    } catch (err) {
      if (err instanceof QueryFailedError && (err as { code?: string }).code === '23505') {
        return null;
      }
      throw err;
    }
  }

  async listByRecipient(recipientId: string, pageRequest: PageRequest): Promise<PageResult<Notification>> {
    const qb = this.repo
      .createQueryBuilder('n')
      .where('n.recipientId = :recipientId', { recipientId })
      .orderBy('n.createdAt', 'DESC')
      .addOrderBy('n.id', 'ASC');

    const totalItems = await qb.getCount();
    const meta = buildPageMeta(totalItems, pageRequest.page, pageRequest.pageSize);
    const items = await qb
      .skip((meta.page - 1) * meta.pageSize)
      .take(meta.pageSize)
      .getMany();

    return { items: items.map(toDomain), meta };
  }

  async countUnread(recipientId: string): Promise<number> {
    return this.repo.count({ where: { recipientId, isRead: false } });
  }

  async markRead(id: string, recipientId: string): Promise<Notification | null> {
    const entity = await this.repo.findOne({ where: { id, recipientId } });
    if (!entity) return null;
    entity.isRead = true;
    const saved = await this.repo.save(entity);
    return toDomain(saved);
  }

  async markAllRead(recipientId: string): Promise<number> {
    const now = new Date();
    const result = await this.repo.update(
      { recipientId, isRead: false },
      { isRead: true, updatedAt: now },
    );
    return result.affected ?? 0;
  }

  async purgeReadOlderThan(recipientId: string, updatedBefore: Date): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .from(NotificationEntity)
      .where('recipient_id = :recipientId', { recipientId })
      .andWhere('is_read = true')
      .andWhere('updated_at < :updatedBefore', { updatedBefore })
      .execute();
    return result.affected ?? 0;
  }
}
