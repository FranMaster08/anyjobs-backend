import { Module } from '@nestjs/common';
import { OpenRequestsController } from './api/controllers/open-requests.controller';
import { ListOpenRequestsUseCase } from './application/use-cases/list-open-requests.use-case';
import { ListNearbyOpenRequestsUseCase } from './application/use-cases/list-nearby-open-requests.use-case';
import { ListMyOpenRequestsUseCase } from './application/use-cases/list-my-open-requests.use-case';
import { GetOpenRequestDetailUseCase } from './application/use-cases/get-open-request-detail.use-case';
import { CreateOpenRequestUseCase } from './application/use-cases/create-open-request.use-case';
import { UpdateOpenRequestUseCase } from './application/use-cases/update-open-request.use-case';
import { DeleteOpenRequestUseCase } from './application/use-cases/delete-open-request.use-case';
import { OPEN_REQUESTS_REPOSITORY } from './application/ports/tokens';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenRequestEntity } from './infrastructure/entities/open-request.entity';
import { OpenRequestImageEntity } from './infrastructure/entities/open-request-image.entity';
import { OpenRequestInteractionEntity } from './infrastructure/entities/open-request-interaction.entity';
import { OpenRequestsInteractionsService } from './application/open-requests-interactions.service';
import { OpenRequestsEngagementMetricsService } from './application/open-requests-engagement-metrics.service';
import { OpenRequestsRankingService } from './application/open-requests-ranking.service';
import { TypeOrmOpenRequestsRepository } from './infrastructure/adapters/typeorm-open-requests.repository';
import { ProposalEntity } from '../proposals/infrastructure/entities/proposal.entity';
import { IMAGE_STORAGE_PROVIDER } from './application/ports/tokens';
import { LocalImageStorageProvider } from './infrastructure/adapters/local-image-storage.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OpenRequestEntity,
      OpenRequestImageEntity,
      OpenRequestInteractionEntity,
      ProposalEntity,
    ]),
  ],
  controllers: [OpenRequestsController],
  providers: [
    ListOpenRequestsUseCase,
    ListNearbyOpenRequestsUseCase,
    ListMyOpenRequestsUseCase,
    GetOpenRequestDetailUseCase,
    CreateOpenRequestUseCase,
    UpdateOpenRequestUseCase,
    DeleteOpenRequestUseCase,
    OpenRequestsInteractionsService,
    OpenRequestsEngagementMetricsService,
    OpenRequestsRankingService,
    { provide: OPEN_REQUESTS_REPOSITORY, useClass: TypeOrmOpenRequestsRepository },
    { provide: IMAGE_STORAGE_PROVIDER, useClass: LocalImageStorageProvider },
  ],
  exports: [OPEN_REQUESTS_REPOSITORY],
})
export class OpenRequestsModule {}

