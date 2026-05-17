import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './api/controllers/notifications.controller';
import { NOTIFICATIONS_REPOSITORY } from './application/ports/tokens';
import { NotificationDispatchService } from './application/services/notification-dispatch.service';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { ListNotificationsUseCase } from './application/use-cases/list-notifications.use-case';
import { GetUnreadCountUseCase } from './application/use-cases/get-unread-count.use-case';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-notification-read.use-case';
import { MarkAllNotificationsReadUseCase } from './application/use-cases/mark-all-notifications-read.use-case';
import { PurgeExpiredReadNotificationsUseCase } from './application/use-cases/purge-expired-read-notifications.use-case';
import { NotificationEntity } from './infrastructure/entities/notification.entity';
import { TypeOrmNotificationsRepository } from './infrastructure/adapters/typeorm-notifications.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  controllers: [NotificationsController],
  providers: [
    CreateNotificationUseCase,
    ListNotificationsUseCase,
    GetUnreadCountUseCase,
    MarkNotificationReadUseCase,
    MarkAllNotificationsReadUseCase,
    PurgeExpiredReadNotificationsUseCase,
    NotificationDispatchService,
    { provide: NOTIFICATIONS_REPOSITORY, useClass: TypeOrmNotificationsRepository },
  ],
  exports: [NotificationDispatchService, NOTIFICATIONS_REPOSITORY],
})
export class NotificationsModule {}
