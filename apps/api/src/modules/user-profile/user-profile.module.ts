import { Module } from '@nestjs/common';
import { UserProfileController } from './api/controllers/user-profile.controller';
import { UserPublicProfileController } from './api/controllers/user-public-profile.controller';
import { UpdateLocationUseCase } from './application/use-cases/update-location.use-case';
import { UpdateWorkerProfileUseCase } from './application/use-cases/update-worker-profile.use-case';
import { UpdateClientProfileUseCase } from './application/use-cases/update-client-profile.use-case';
import { UpdatePersonalInfoUseCase } from './application/use-cases/update-personal-info.use-case';
import { USER_PROFILE_USER_REPOSITORY } from './application/ports/tokens';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../shared/persistence/entities';
import { TypeOrmUserProfileRepository } from './infrastructure/adapters/typeorm-user-profile.repository';
import { OpenRequestEntity } from '../open-requests/infrastructure/entities/open-request.entity';
import { ProposalEntity } from '../proposals/infrastructure/entities/proposal.entity';
import { UserProfileReadService } from './application/user-profile-read.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, OpenRequestEntity, ProposalEntity]), AuthModule],
  controllers: [UserProfileController, UserPublicProfileController],
  providers: [
    UpdateLocationUseCase,
    UpdateWorkerProfileUseCase,
    UpdateClientProfileUseCase,
    UpdatePersonalInfoUseCase,
    UserProfileReadService,
    { provide: USER_PROFILE_USER_REPOSITORY, useClass: TypeOrmUserProfileRepository },
  ],
})
export class UserProfileModule {}

