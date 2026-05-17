import { Inject, Injectable } from '@nestjs/common';
import { OPEN_REQUESTS_REPOSITORY } from '../../../open-requests/application/ports/tokens';
import type { OpenRequestsRepositoryPort } from '../../../open-requests/application/ports/open-requests-repository.port';
import { AppException } from '../../../../shared/errors/app-exception';
import { PROPOSALS_REPOSITORY } from '../ports';
import type { ProposalsRepositoryPort } from '../ports';
import type { Proposal } from '../../domain';
import { ProposalFactory } from '../../domain';
import { NotificationDispatchService } from '../../../notifications/application/services/notification-dispatch.service';

export interface CreateProposalInput {
  requestId: string;
  userId: string;
  authorName: string;
  authorSubtitle: string;
  whoAmI: string;
  message: string;
  estimate: string;
}

@Injectable()
export class CreateProposalUseCase {
  constructor(
    @Inject(PROPOSALS_REPOSITORY) private readonly proposalsRepo: ProposalsRepositoryPort,
    @Inject(OPEN_REQUESTS_REPOSITORY) private readonly openRequestsRepo: OpenRequestsRepositoryPort,
    private readonly notificationDispatch: NotificationDispatchService,
  ) {}

  async execute(input: CreateProposalInput): Promise<Proposal> {
    const ownerRow = await this.openRequestsRepo.findOwnerId(input.requestId);
    if (!ownerRow) throw new AppException('OPEN_REQUEST.NOT_FOUND');
    const ownerUserId = ownerRow.ownerUserId;
    if (!ownerUserId) {
      throw new AppException('VALIDATION.INVALID_INPUT', 'Open request has no owner', {
        requestId: 'Cannot create proposal for a request without owner.',
      });
    }
    if (ownerUserId === input.userId) {
      throw new AppException('PROPOSAL.CANNOT_APPLY_TO_OWN_REQUEST');
    }
    const duplicate = await this.proposalsRepo.existsForRequestAndUser(input.requestId, input.userId);
    if (duplicate) {
      throw new AppException('PROPOSAL.ALREADY_EXISTS');
    }

    const newProposal = ProposalFactory.createNew(input, new Date().toISOString());
    const created = await this.proposalsRepo.create(newProposal);
    await this.notificationDispatch.notifyProposalReceived({
      recipientId: ownerUserId,
      actorUserId: input.userId,
      requestId: input.requestId,
      proposalId: created.id,
    });
    return created;
  }
}
