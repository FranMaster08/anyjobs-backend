import { Inject, Injectable } from '@nestjs/common';
import { readNotificationRetentionCutoff } from '../../domain/notification-retention';
import { NOTIFICATIONS_REPOSITORY } from '../ports/tokens';
import type { NotificationsRepositoryPort } from '../ports/notifications-repository.port';

@Injectable()
export class PurgeExpiredReadNotificationsUseCase {
  constructor(@Inject(NOTIFICATIONS_REPOSITORY) private readonly repo: NotificationsRepositoryPort) {}

  async execute(recipientId: string): Promise<number> {
    const cutoff = readNotificationRetentionCutoff();
    return this.repo.purgeReadOlderThan(recipientId, cutoff);
  }
}
