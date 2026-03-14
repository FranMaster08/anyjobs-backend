import { Module } from '@nestjs/common';
import { UserProfileController } from './api/controllers/user-profile.controller';
import { UpdateLocationUseCase } from './application/use-cases/update-location.use-case';
import { UpdateWorkerProfileUseCase } from './application/use-cases/update-worker-profile.use-case';
import { UpdateClientProfileUseCase } from './application/use-cases/update-client-profile.use-case';
import { UpdatePersonalInfoUseCase } from './application/use-cases/update-personal-info.use-case';
import { USER_PROFILE_USER_REPOSITORY } from './application/ports/tokens';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../shared/persistence/entities';
import { TypeOrmUserProfileRepository } from './infrastructure/adapters/typeorm-user-profile.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserProfileController],
  providers: [
    UpdateLocationUseCase,
    UpdateWorkerProfileUseCase,
    UpdateClientProfileUseCase,
    UpdatePersonalInfoUseCase,
    { provide: USER_PROFILE_USER_REPOSITORY, useClass: TypeOrmUserProfileRepository },
  ],
})
export class UserProfileModule {}

