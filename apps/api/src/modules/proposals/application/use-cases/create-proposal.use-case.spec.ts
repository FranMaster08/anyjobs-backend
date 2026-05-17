import { CreateProposalUseCase } from './create-proposal.use-case';
import type { ProposalsRepositoryPort } from '../ports/proposals-repository.port';
import type { OpenRequestsRepositoryPort } from '../../../open-requests/application/ports/open-requests-repository.port';
import { NotificationDispatchService } from '../../../notifications/application/services/notification-dispatch.service';
import { CreateNotificationUseCase } from '../../../notifications/application/use-cases/create-notification.use-case';
import { InMemoryNotificationsRepository } from '../../../notifications/infrastructure/adapters/in-memory-notifications.repository';

describe(CreateProposalUseCase.name, () => {
  const ownerId = 'owner-1';
  const actorId = 'actor-1';
  const requestId = 'req-1';

  let proposalsRepo: jest.Mocked<Pick<ProposalsRepositoryPort, 'existsForRequestAndUser' | 'create'>>;
  let openRequestsRepo: jest.Mocked<Pick<OpenRequestsRepositoryPort, 'findOwnerId'>>;
  let notificationsRepo: InMemoryNotificationsRepository;
  let useCase: CreateProposalUseCase;

  beforeEach(() => {
    proposalsRepo = {
      existsForRequestAndUser: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockResolvedValue({
        id: 'prop-1',
        requestId,
        userId: actorId,
        author: { name: 'A', subtitle: 'B' },
        whoAmI: 'pro',
        message: 'hola',
        estimate: '€10',
        createdAt: new Date().toISOString(),
        status: 'SENT',
      }),
    };
    openRequestsRepo = {
      findOwnerId: jest.fn().mockResolvedValue({ ownerUserId: ownerId }),
    };
    notificationsRepo = new InMemoryNotificationsRepository();
    const createNotification = new CreateNotificationUseCase(notificationsRepo);
    const dispatch = new NotificationDispatchService(createNotification);
    useCase = new CreateProposalUseCase(
      proposalsRepo as unknown as ProposalsRepositoryPort,
      openRequestsRepo as unknown as OpenRequestsRepositoryPort,
      dispatch,
    );
  });

  it('creates notification for owner when another user applies', async () => {
    await useCase.execute({
      requestId,
      userId: actorId,
      authorName: 'Ana',
      authorSubtitle: 'Pro',
      whoAmI: 'limpieza',
      message: 'puedo',
      estimate: '€50',
    });

    const list = await notificationsRepo.listByRecipient(ownerId, { page: 1, pageSize: 20 });
    expect(list.items).toHaveLength(1);
    expect(list.items[0].recipientId).toBe(ownerId);
    expect(list.items[0].type).toBe('PROPOSAL_RECEIVED');
  });

  it('does not create notification when actor is owner (rejected before notify)', async () => {
    await expect(
      useCase.execute({
        requestId,
        userId: ownerId,
        authorName: 'Owner',
        authorSubtitle: 'X',
        whoAmI: 'x',
        message: 'x',
        estimate: '€1',
      }),
    ).rejects.toBeDefined();

    const list = await notificationsRepo.listByRecipient(ownerId, { page: 1, pageSize: 20 });
    expect(list.items).toHaveLength(0);
  });

  it('deduplicates notification for same proposal id', async () => {
    await useCase.execute({
      requestId,
      userId: actorId,
      authorName: 'Ana',
      authorSubtitle: 'Pro',
      whoAmI: 'limpieza',
      message: 'puedo',
      estimate: '€50',
    });
    await notificationsRepo.create({
      recipientId: ownerId,
      type: 'PROPOSAL_RECEIVED',
      title: 'Nueva postulación',
      message: 'dup',
      entityType: 'open_request',
      entityId: requestId,
      dedupKey: 'proposal:prop-1',
    });

    const list = await notificationsRepo.listByRecipient(ownerId, { page: 1, pageSize: 20 });
    expect(list.items).toHaveLength(1);
  });

  it('still returns proposal when notification creation fails', async () => {
    const failingRepo = {
      create: jest.fn().mockRejectedValue(new Error('db down')),
      listByRecipient: jest.fn(),
      countUnread: jest.fn(),
      markRead: jest.fn(),
      markAllRead: jest.fn(),
    };
    const createNotification = new CreateNotificationUseCase(failingRepo as never);
    const dispatch = new NotificationDispatchService(createNotification);
    const uc = new CreateProposalUseCase(
      proposalsRepo as unknown as ProposalsRepositoryPort,
      openRequestsRepo as unknown as OpenRequestsRepositoryPort,
      dispatch,
    );

    const created = await uc.execute({
      requestId,
      userId: actorId,
      authorName: 'Ana',
      authorSubtitle: 'Pro',
      whoAmI: 'limpieza',
      message: 'puedo',
      estimate: '€50',
    });

    expect(created.id).toBe('prop-1');
  });
});
