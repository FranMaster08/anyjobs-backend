import { Injectable, Logger } from '@nestjs/common';
import { NotificationEntityType, NotificationType } from '../../domain';
import { CreateNotificationUseCase } from '../use-cases/create-notification.use-case';

export interface NotifyProposalReceivedInput {
  recipientId: string;
  actorUserId: string;
  requestId: string;
  proposalId: string;
}

@Injectable()
export class NotificationDispatchService {
  private readonly logger = new Logger(NotificationDispatchService.name);

  constructor(private readonly createNotification: CreateNotificationUseCase) {}

  async notifyProposalReceived(input: NotifyProposalReceivedInput): Promise<void> {
    try {
      if (input.recipientId === input.actorUserId) return;

      await this.createNotification.execute({
        recipientId: input.recipientId,
        type: NotificationType.PROPOSAL_RECEIVED,
        title: 'Nueva postulación',
        message: 'Alguien se postuló a tu solicitud.',
        entityType: NotificationEntityType.OPEN_REQUEST,
        entityId: input.requestId,
        actorUserId: input.actorUserId,
        dedupKey: `proposal:${input.proposalId}`,
      });
    } catch (err: unknown) {
      this.logNotifyFailure(input.requestId, input.recipientId, err);
    }
  }

  private logNotifyFailure(requestId: string, recipientId: string, err: unknown): void {
    this.logger.warn(
      `Failed to create proposal notification for request=${requestId} recipient=${recipientId}`,
      err instanceof Error ? err.stack : String(err),
    );
  }
}
