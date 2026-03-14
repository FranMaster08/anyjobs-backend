import { Module } from '@nestjs/common';
import { OpenRequestsController } from './api/controllers/open-requests.controller';
import { ListOpenRequestsUseCase } from './application/use-cases/list-open-requests.use-case';
import { GetOpenRequestDetailUseCase } from './application/use-cases/get-open-request-detail.use-case';
import { OPEN_REQUESTS_REPOSITORY } from './application/ports/tokens';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenRequestEntity } from './infrastructure/entities/open-request.entity';
import { TypeOrmOpenRequestsRepository } from './infrastructure/adapters/typeorm-open-requests.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OpenRequestEntity])],
  controllers: [OpenRequestsController],
  providers: [
    ListOpenRequestsUseCase,
    GetOpenRequestDetailUseCase,
    { provide: OPEN_REQUESTS_REPOSITORY, useClass: TypeOrmOpenRequestsRepository },
  ],
})
export class OpenRequestsModule {}

