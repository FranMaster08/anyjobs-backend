import { Module } from '@nestjs/common';
import { OpenRequestsController } from './api/controllers/open-requests.controller';
import { ListOpenRequestsUseCase } from './application/use-cases/list-open-requests.use-case';
import { GetOpenRequestDetailUseCase } from './application/use-cases/get-open-request-detail.use-case';
import { OPEN_REQUESTS_REPOSITORY } from './application/ports/tokens';
import { InMemoryOpenRequestsRepository } from './infrastructure/adapters/in-memory-open-requests.repository';

@Module({
  controllers: [OpenRequestsController],
  providers: [
    ListOpenRequestsUseCase,
    GetOpenRequestDetailUseCase,
    { provide: OPEN_REQUESTS_REPOSITORY, useClass: InMemoryOpenRequestsRepository },
  ],
})
export class OpenRequestsModule {}

