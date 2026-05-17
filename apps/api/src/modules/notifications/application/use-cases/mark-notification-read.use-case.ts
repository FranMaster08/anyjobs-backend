import { Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../../../shared/errors/app-exception';
import type { Notification } from '../../domain';
import { NOTIFICATIONS_REPOSITORY } from '../ports/tokens';
import type { NotificationsRepositoryPort } from '../ports/notifications-repository.port';

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(@Inject(NOTIFICATIONS_REPOSITORY) private readonly repo: NotificationsRepositoryPort) {}

  async execute(id: string, recipientId: string): Promise<Notification> {
    const updated = await this.repo.markRead(id, recipientId);
    if (!updated) throw new AppException('NOTIFICATION.NOT_FOUND');
    return updated;
  }
}
