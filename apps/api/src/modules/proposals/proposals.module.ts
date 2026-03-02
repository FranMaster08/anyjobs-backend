import { Module } from '@nestjs/common';
import { ProposalsController } from './api/controllers/proposals.controller';
import { ListProposalsUseCase } from './application/use-cases/list-proposals.use-case';
import { CreateProposalUseCase } from './application/use-cases/create-proposal.use-case';
import { PROPOSALS_REPOSITORY } from './application/ports/tokens';
import { InMemoryProposalsRepository } from './infrastructure/adapters/in-memory-proposals.repository';

@Module({
  controllers: [ProposalsController],
  providers: [
    ListProposalsUseCase,
    CreateProposalUseCase,
    { provide: PROPOSALS_REPOSITORY, useClass: InMemoryProposalsRepository },
  ],
})
export class ProposalsModule {}

