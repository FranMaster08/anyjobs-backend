import { MarkNotificationReadUseCase } from './mark-notification-read.use-case';
import { CreateNotificationUseCase } from './create-notification.use-case';
import { GetUnreadCountUseCase } from './get-unread-count.use-case';
import { PurgeExpiredReadNotificationsUseCase } from './purge-expired-read-notifications.use-case';
import { InMemoryNotificationsRepository } from '../../infrastructure/adapters/in-memory-notifications.repository';
import { NotificationEntityType, NotificationType } from '../../domain';

describe('Notifications use cases (in-memory)', () => {
  const userA = 'user-a';
  const userB = 'user-b';
  let repo: InMemoryNotificationsRepository;
  let create: CreateNotificationUseCase;
  let markRead: MarkNotificationReadUseCase;
  let unread: GetUnreadCountUseCase;

  beforeEach(() => {
    repo = new InMemoryNotificationsRepository();
    create = new CreateNotificationUseCase(repo);
    markRead = new MarkNotificationReadUseCase(repo);
    unread = new GetUnreadCountUseCase(repo, new PurgeExpiredReadNotificationsUseCase(repo));
  });

  it('isolates notifications per recipient', async () => {
    const n = await create.execute({
      recipientId: userA,
      type: NotificationType.PROPOSAL_RECEIVED,
      title: 'T',
      message: 'M',
      entityType: NotificationEntityType.OPEN_REQUEST,
      entityId: 'req-1',
    });
    expect(n).not.toBeNull();

    expect(await unread.execute(userA)).toBe(1);
    expect(await unread.execute(userB)).toBe(0);

    await markRead.execute(n!.id, userA);
    expect(await unread.execute(userA)).toBe(0);
  });

  it('denies marking another user notification', async () => {
    const n = await create.execute({
      recipientId: userA,
      type: NotificationType.PROPOSAL_RECEIVED,
      title: 'T',
      message: 'M',
      entityType: NotificationEntityType.OPEN_REQUEST,
      entityId: 'req-1',
    });

    await expect(markRead.execute(n!.id, userB)).rejects.toMatchObject({
      errorCode: 'NOTIFICATION.NOT_FOUND',
    });
  });
});
