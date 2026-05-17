import { Inject, Injectable } from '@nestjs/common';
import type { CreateNotificationInput, Notification } from '../../domain';
import { NOTIFICATIONS_REPOSITORY } from '../ports/tokens';
import type { NotificationsRepositoryPort } from '../ports/notifications-repository.port';

@Injectable()
export class CreateNotificationUseCase {
  constructor(@Inject(NOTIFICATIONS_REPOSITORY) private readonly repo: NotificationsRepositoryPort) {}

  async execute(input: CreateNotificationInput): Promise<Notification | null> {
    return this.repo.create(input);
  }
}
