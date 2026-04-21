import { Module } from '@nestjs/common';
import { OpenRequestsController } from './api/controllers/open-requests.controller';
import { ListOpenRequestsUseCase } from './application/use-cases/list-open-requests.use-case';
import { GetOpenRequestDetailUseCase } from './application/use-cases/get-open-request-detail.use-case';
import { CreateOpenRequestUseCase } from './application/use-cases/create-open-request.use-case';
import { UpdateOpenRequestUseCase } from './application/use-cases/update-open-request.use-case';
import { DeleteOpenRequestUseCase } from './application/use-cases/delete-open-request.use-case';
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
    CreateOpenRequestUseCase,
    UpdateOpenRequestUseCase,
    DeleteOpenRequestUseCase,
    { provide: OPEN_REQUESTS_REPOSITORY, useClass: TypeOrmOpenRequestsRepository },
  ],
})
export class OpenRequestsModule {}

