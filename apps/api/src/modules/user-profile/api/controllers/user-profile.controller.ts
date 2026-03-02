import { Body, Controller, HttpCode, Patch, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { RequirePermissions } from '../../../../shared/security/require-permissions.decorator';
import {
  UpdateClientProfileRequestDto,
  UpdateLocationRequestDto,
  UpdatePersonalInfoRequestDto,
  UpdateWorkerProfileRequestDto,
} from '../dtos';
import {
  PatchMeClientProfileSwagger,
  PatchMeLocationSwagger,
  PatchMePersonalInfoSwagger,
  PatchMeWorkerProfileSwagger,
} from '../swagger';
import { UpdateLocationUseCase } from '../../application/use-cases/update-location.use-case';
import { UpdateWorkerProfileUseCase } from '../../application/use-cases/update-worker-profile.use-case';
import { UpdateClientProfileUseCase } from '../../application/use-cases/update-client-profile.use-case';
import { UpdatePersonalInfoUseCase } from '../../application/use-cases/update-personal-info.use-case';

type RequestUser = { token: string; userId?: string; roles: string[]; permissions: string[] };
type RequestWithUser = Request & { user?: RequestUser };

@ApiTags('Users')
@Controller('users/me')
export class UserProfileController {
  constructor(
    private readonly updateLocationUseCase: UpdateLocationUseCase,
    private readonly updateWorkerProfileUseCase: UpdateWorkerProfileUseCase,
    private readonly updateClientProfileUseCase: UpdateClientProfileUseCase,
    private readonly updatePersonalInfoUseCase: UpdatePersonalInfoUseCase,
  ) {}

  @RequirePermissions('users.me.write')
  @PatchMeLocationSwagger()
  @HttpCode(204)
  @Patch('location')
  async updateLocation(@Req() req: RequestWithUser, @Body() body: UpdateLocationRequestDto): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    await this.updateLocationUseCase.execute({ userId, ...body });
  }

  @RequirePermissions('users.me.write')
  @PatchMeWorkerProfileSwagger()
  @HttpCode(204)
  @Patch('worker-profile')
  async updateWorkerProfile(
    @Req() req: RequestWithUser,
    @Body() body: UpdateWorkerProfileRequestDto,
  ): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    await this.updateWorkerProfileUseCase.execute({
      userId,
      actorRoles: (req.user?.roles ?? []) as any,
      categories: body.categories,
      headline: body.headline,
      bio: body.bio,
    });
  }

  @RequirePermissions('users.me.write')
  @PatchMeClientProfileSwagger()
  @HttpCode(204)
  @Patch('client-profile')
  async updateClientProfile(
    @Req() req: RequestWithUser,
    @Body() body: UpdateClientProfileRequestDto,
  ): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    await this.updateClientProfileUseCase.execute({ userId, ...body });
  }

  @RequirePermissions('users.me.write')
  @PatchMePersonalInfoSwagger()
  @HttpCode(204)
  @Patch('personal-info')
  async updatePersonalInfo(
    @Req() req: RequestWithUser,
    @Body() body: UpdatePersonalInfoRequestDto,
  ): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    await this.updatePersonalInfoUseCase.execute({
      userId,
      actorRoles: (req.user?.roles ?? []) as any,
      ...body,
    });
  }
}

