import type { CreateProposalCommand } from '../interfaces/create-proposal-command.interface';
import type { NewProposal } from '../types/new-proposal.type';

export class ProposalFactory {
  static createNew(command: CreateProposalCommand, nowIso: string): NewProposal {
    return {
      requestId: command.requestId,
      userId: command.userId,
      author: {
        name: command.authorName.trim(),
        subtitle: command.authorSubtitle.trim(),
      },
      whoAmI: command.whoAmI.trim(),
      message: command.message.trim(),
      estimate: command.estimate.trim(),
      createdAt: nowIso,
      status: 'SENT',
    };
  }
}

