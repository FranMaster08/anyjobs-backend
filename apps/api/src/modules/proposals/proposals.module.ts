import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenRequestsModule } from '../open-requests/open-requests.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProposalsController } from './api/controllers/proposals.controller';
import { ListProposalsUseCase } from './application/use-cases/list-proposals.use-case';
import { CreateProposalUseCase } from './application/use-cases/create-proposal.use-case';
import { PROPOSALS_REPOSITORY } from './application/ports/tokens';
import { ProposalEntity } from './infrastructure/entities/proposal.entity';
import { TypeOrmProposalsRepository } from './infrastructure/adapters/typeorm-proposals.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProposalEntity]), OpenRequestsModule, NotificationsModule],
  controllers: [ProposalsController],
  providers: [
    ListProposalsUseCase,
    CreateProposalUseCase,
    { provide: PROPOSALS_REPOSITORY, useClass: TypeOrmProposalsRepository },
  ],
})
export class ProposalsModule {}

