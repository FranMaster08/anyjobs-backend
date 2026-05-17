import { Controller, Get, Param, Patch, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { RequirePermissions } from '../../../../shared/security/require-permissions.decorator';
import { ListNotificationsUseCase } from '../../application/use-cases/list-notifications.use-case';
import { GetUnreadCountUseCase } from '../../application/use-cases/get-unread-count.use-case';
import { MarkNotificationReadUseCase } from '../../application/use-cases/mark-notification-read.use-case';
import { MarkAllNotificationsReadUseCase } from '../../application/use-cases/mark-all-notifications-read.use-case';
import {
  MarkAllReadResponseDto,
  NotificationDto,
  NotificationsListResponseDto,
  UnreadCountResponseDto,
} from '../dtos';
import {
  GetNotificationsSwagger,
  GetUnreadCountSwagger,
  PatchNotificationReadSwagger,
  PatchReadAllSwagger,
} from '../swagger';

type AuthedRequest = Request & { user: { userId: string } };

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly listUseCase: ListNotificationsUseCase,
    private readonly unreadCountUseCase: GetUnreadCountUseCase,
    private readonly markReadUseCase: MarkNotificationReadUseCase,
    private readonly markAllReadUseCase: MarkAllNotificationsReadUseCase,
  ) {}

  @RequirePermissions('notifications.read.own')
  @GetNotificationsSwagger()
  @Get()
  async list(
    @Req() req: AuthedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<NotificationsListResponseDto> {
    const res = await this.listUseCase.execute({
      recipientId: req.user.userId,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    return res as unknown as NotificationsListResponseDto;
  }

  @RequirePermissions('notifications.read.own')
  @GetUnreadCountSwagger()
  @Get('unread-count')
  async unreadCount(@Req() req: AuthedRequest): Promise<UnreadCountResponseDto> {
    const count = await this.unreadCountUseCase.execute(req.user.userId);
    return { count };
  }

  @RequirePermissions('notifications.update.own')
  @PatchReadAllSwagger()
  @Patch('read-all')
  async markAllRead(@Req() req: AuthedRequest): Promise<MarkAllReadResponseDto> {
    return this.markAllReadUseCase.execute(req.user.userId);
  }

  @RequirePermissions('notifications.update.own')
  @PatchNotificationReadSwagger()
  @Patch(':id/read')
  async markRead(@Req() req: AuthedRequest, @Param('id') id: string): Promise<NotificationDto> {
    const updated = await this.markReadUseCase.execute(id, req.user.userId);
    return updated as unknown as NotificationDto;
  }
}
