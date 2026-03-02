import { Inject, Injectable } from '@nestjs/common';
import { PROPOSALS_REPOSITORY } from '../ports';
import type { ProposalsRepositoryPort } from '../ports';
import type { Proposal } from '../../domain';
import { ProposalFactory } from '../../domain';

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
  constructor(@Inject(PROPOSALS_REPOSITORY) private readonly repo: ProposalsRepositoryPort) {}

  async execute(input: CreateProposalInput): Promise<Proposal> {
    const newProposal = ProposalFactory.createNew(input, new Date().toISOString());
    return this.repo.create(newProposal);
  }
}

