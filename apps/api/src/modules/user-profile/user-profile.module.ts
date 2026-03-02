import { Module } from '@nestjs/common';
import { UserProfileController } from './api/controllers/user-profile.controller';
import { UpdateLocationUseCase } from './application/use-cases/update-location.use-case';
import { UpdateWorkerProfileUseCase } from './application/use-cases/update-worker-profile.use-case';
import { UpdateClientProfileUseCase } from './application/use-cases/update-client-profile.use-case';
import { UpdatePersonalInfoUseCase } from './application/use-cases/update-personal-info.use-case';
import { USER_PROFILE_USER_REPOSITORY } from './application/ports/tokens';
import { InMemoryUserProfileRepository } from './infrastructure/adapters/in-memory-user-profile.repository';

@Module({
  controllers: [UserProfileController],
  providers: [
    UpdateLocationUseCase,
    UpdateWorkerProfileUseCase,
    UpdateClientProfileUseCase,
    UpdatePersonalInfoUseCase,
    { provide: USER_PROFILE_USER_REPOSITORY, useClass: InMemoryUserProfileRepository },
  ],
})
export class UserProfileModule {}

