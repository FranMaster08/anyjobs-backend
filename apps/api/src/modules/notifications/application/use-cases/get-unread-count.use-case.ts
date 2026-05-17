import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATIONS_REPOSITORY } from '../ports/tokens';
import type { NotificationsRepositoryPort } from '../ports/notifications-repository.port';
import { PurgeExpiredReadNotificationsUseCase } from './purge-expired-read-notifications.use-case';

@Injectable()
export class GetUnreadCountUseCase {
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY) private readonly repo: NotificationsRepositoryPort,
    private readonly purgeExpiredRead: PurgeExpiredReadNotificationsUseCase,
  ) {}

  async execute(recipientId: string): Promise<number> {
    await this.purgeExpiredRead.execute(recipientId);
    return this.repo.countUnread(recipientId);
  }
}
