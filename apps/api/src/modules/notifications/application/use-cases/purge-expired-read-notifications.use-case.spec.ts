import { PurgeExpiredReadNotificationsUseCase } from './purge-expired-read-notifications.use-case';
import { CreateNotificationUseCase } from './create-notification.use-case';
import { MarkNotificationReadUseCase } from './mark-notification-read.use-case';
import { InMemoryNotificationsRepository } from '../../infrastructure/adapters/in-memory-notifications.repository';
import { NotificationEntityType, NotificationType } from '../../domain';
import type { Notification } from '../../domain';

describe(PurgeExpiredReadNotificationsUseCase.name, () => {
  const recipientId = 'user-a';

  function setUpdatedAt(repo: InMemoryNotificationsRepository, id: string, iso: string): void {
    const store = repo as unknown as { notifications: Notification[] };
    const item = store.notifications.find((n) => n.id === id);
    if (item) item.updatedAt = iso;
  }

  it('removes read notifications older than 1 day and keeps unread', async () => {
    const repo = new InMemoryNotificationsRepository();
    const create = new CreateNotificationUseCase(repo);
    const markRead = new MarkNotificationReadUseCase(repo);
    const purge = new PurgeExpiredReadNotificationsUseCase(repo);

    const unread = await create.execute({
      recipientId,
      type: NotificationType.PROPOSAL_RECEIVED,
      title: 'Nueva',
      message: 'Mensaje',
      entityType: NotificationEntityType.OPEN_REQUEST,
      entityId: 'req-1',
    });

    const oldRead = await create.execute({
      recipientId,
      type: NotificationType.PROPOSAL_RECEIVED,
      title: 'Antigua',
      message: 'Mensaje',
      entityType: NotificationEntityType.OPEN_REQUEST,
      entityId: 'req-2',
    });
    await markRead.execute(oldRead!.id, recipientId);
    setUpdatedAt(repo, oldRead!.id, new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString());

    const removed = await purge.execute(recipientId);
    expect(removed).toBe(1);

    const list = await repo.listByRecipient(recipientId, { page: 1, pageSize: 20 });
    expect(list.items).toHaveLength(1);
    expect(list.items[0].id).toBe(unread!.id);
    expect(list.items[0].isRead).toBe(false);
  });

  it('keeps read notifications within 1 day', async () => {
    const repo = new InMemoryNotificationsRepository();
    const create = new CreateNotificationUseCase(repo);
    const markRead = new MarkNotificationReadUseCase(repo);
    const purge = new PurgeExpiredReadNotificationsUseCase(repo);

    const recent = await create.execute({
      recipientId,
      type: NotificationType.PROPOSAL_RECEIVED,
      title: 'Reciente',
      message: 'Mensaje',
      entityType: NotificationEntityType.OPEN_REQUEST,
      entityId: 'req-3',
    });
    await markRead.execute(recent!.id, recipientId);

    const removed = await purge.execute(recipientId);
    expect(removed).toBe(0);

    const list = await repo.listByRecipient(recipientId, { page: 1, pageSize: 20 });
    expect(list.items).toHaveLength(1);
    expect(list.items[0].isRead).toBe(true);
  });
});
