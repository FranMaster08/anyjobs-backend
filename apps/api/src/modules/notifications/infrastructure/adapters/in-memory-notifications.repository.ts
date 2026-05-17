import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { buildPageMeta } from '../../../../shared/application/pagination/page-result';
import type { PageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import type { CreateNotificationInput, Notification } from '../../domain';
import type { NotificationsRepositoryPort } from '../../application/ports/notifications-repository.port';

@Injectable()
export class InMemoryNotificationsRepository implements NotificationsRepositoryPort {
  private readonly notifications: Notification[] = [];

  async create(input: CreateNotificationInput): Promise<Notification | null> {
    if (input.dedupKey) {
      const dup = this.notifications.some(
        (n) => n.recipientId === input.recipientId && n.dedupKey === input.dedupKey,
      );
      if (dup) return null;
    }
    const now = new Date().toISOString();
    const notification: Notification = {
      id: randomUUID(),
      ...input,
      isRead: false,
      createdAt: now,
      updatedAt: now,
    };
    this.notifications.push(notification);
    return notification;
  }

  async listByRecipient(recipientId: string, pageRequest: PageRequest): Promise<PageResult<Notification>> {
    const filtered = this.notifications.filter((n) => n.recipientId === recipientId);
    const sorted = [...filtered].sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id),
    );
    const totalItems = sorted.length;
    const meta = buildPageMeta(totalItems, pageRequest.page, pageRequest.pageSize);
    const start = (meta.page - 1) * meta.pageSize;
    return { items: sorted.slice(start, start + meta.pageSize), meta };
  }

  async countUnread(recipientId: string): Promise<number> {
    return this.notifications.filter((n) => n.recipientId === recipientId && !n.isRead).length;
  }

  async markRead(id: string, recipientId: string): Promise<Notification | null> {
    const idx = this.notifications.findIndex((n) => n.id === id && n.recipientId === recipientId);
    if (idx < 0) return null;
    const updated = { ...this.notifications[idx], isRead: true, updatedAt: new Date().toISOString() };
    this.notifications[idx] = updated;
    return updated;
  }

  async markAllRead(recipientId: string): Promise<number> {
    let count = 0;
    const now = new Date().toISOString();
    for (let i = 0; i < this.notifications.length; i++) {
      const n = this.notifications[i];
      if (n.recipientId === recipientId && !n.isRead) {
        this.notifications[i] = { ...n, isRead: true, updatedAt: now };
        count++;
      }
    }
    return count;
  }

  async purgeReadOlderThan(recipientId: string, updatedBefore: Date): Promise<number> {
    const cutoff = updatedBefore.getTime();
    const before = this.notifications.length;
    const kept = this.notifications.filter((n) => {
      if (n.recipientId !== recipientId) return true;
      if (!n.isRead) return true;
      return Date.parse(n.updatedAt) >= cutoff;
    });
    this.notifications.splice(0, this.notifications.length, ...kept);
    return before - kept.length;
  }
}
