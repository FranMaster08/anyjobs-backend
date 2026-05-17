import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATIONS_REPOSITORY } from '../ports/tokens';
import type { NotificationsRepositoryPort } from '../ports/notifications-repository.port';

@Injectable()
export class MarkAllNotificationsReadUseCase {
  constructor(@Inject(NOTIFICATIONS_REPOSITORY) private readonly repo: NotificationsRepositoryPort) {}

  async execute(recipientId: string): Promise<{ updated: number }> {
    const updated = await this.repo.markAllRead(recipientId);
    return { updated };
  }
}
