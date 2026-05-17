import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { normalizePageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import type { Notification } from '../../domain';
import { NOTIFICATIONS_REPOSITORY } from '../ports/tokens';
import type { NotificationsRepositoryPort } from '../ports/notifications-repository.port';
import { PurgeExpiredReadNotificationsUseCase } from './purge-expired-read-notifications.use-case';

export interface ListNotificationsInput {
  recipientId: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class ListNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY) private readonly repo: NotificationsRepositoryPort,
    private readonly configService: ConfigService,
    private readonly purgeExpiredRead: PurgeExpiredReadNotificationsUseCase,
  ) {}

  async execute(input: ListNotificationsInput): Promise<PageResult<Notification>> {
    await this.purgeExpiredRead.execute(input.recipientId);
    const limits = this.configService.getOrThrow<{ defaultPageSize: number; maxPageSize: number }>('pagination');
    const pageRequest = normalizePageRequest({ page: input.page, pageSize: input.pageSize }, limits);
    return this.repo.listByRecipient(input.recipientId, pageRequest);
  }
}
