import type { PageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import type { CreateNotificationInput, Notification } from '../../domain';

export interface NotificationsRepositoryPort {
  create(input: CreateNotificationInput): Promise<Notification | null>;
  listByRecipient(recipientId: string, pageRequest: PageRequest): Promise<PageResult<Notification>>;
  countUnread(recipientId: string): Promise<number>;
  markRead(id: string, recipientId: string): Promise<Notification | null>;
  markAllRead(recipientId: string): Promise<number>;
  /** Elimina notificaciones leídas con `updatedAt` anterior al corte (p. ej. leídas hace más de 1 día). */
  purgeReadOlderThan(recipientId: string, updatedBefore: Date): Promise<number>;
}
