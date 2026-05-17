import type { NotificationEntityType, NotificationType } from './notification-type';

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: NotificationEntityType;
  entityId: string;
  actorUserId?: string;
  dedupKey?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationInput {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: NotificationEntityType;
  entityId: string;
  actorUserId?: string;
  dedupKey?: string;
}
