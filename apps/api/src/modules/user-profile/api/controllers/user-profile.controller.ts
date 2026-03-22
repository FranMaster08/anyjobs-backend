import { Body, Controller, HttpCode, Inject, Patch, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { RequirePermissions } from '../../../../shared/security/require-permissions.decorator';
import { Public } from '../../../../shared/security/public.decorator';
import { getCookieValue } from '../../../../shared/http/cookies';
import { AuthTokenRegistry } from '../../../auth/infrastructure/adapters/auth-token-registry';
import { AUTH_REGISTRATION_FLOW_STORE } from '../../../auth/application/ports/tokens';
import type { RegistrationFlowStorePort } from '../../../auth/application/ports/registration-flow-store.port';
import { USER_PROFILE_USER_REPOSITORY } from '../../application/ports';
import type { UserProfileRepositoryPort } from '../../application/ports';
import type { UserRole } from '../../domain';
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

const REG_FLOW_COOKIE = 'aj_reg_flow';

function getBearerToken(req: Request): string | null {
  const authorization = (req.headers['authorization'] as string | undefined) ?? '';
  if (!authorization.trim()) return null;
  if (!authorization.toLowerCase().startsWith('bearer ')) return null;
  const token = authorization.slice('bearer '.length).trim();
  return token.length > 0 ? token : null;
}

@ApiTags('Users')
@Controller('users/me')
export class UserProfileController {
  constructor(
    private readonly updateLocationUseCase: UpdateLocationUseCase,
    private readonly updateWorkerProfileUseCase: UpdateWorkerProfileUseCase,
    private readonly updateClientProfileUseCase: UpdateClientProfileUseCase,
    private readonly updatePersonalInfoUseCase: UpdatePersonalInfoUseCase,
    @Inject(AUTH_REGISTRATION_FLOW_STORE) private readonly regFlowStore: RegistrationFlowStorePort,
    private readonly tokenRegistry: AuthTokenRegistry,
    @Inject(USER_PROFILE_USER_REPOSITORY) private readonly userRepo: UserProfileRepositoryPort,
  ) {}

  private async resolveUserContext(req: RequestWithUser): Promise<{ userId: string; roles: UserRole[] }> {
    // 1) Si viene Authorization, resolver desde el registry (login).
    const token = getBearerToken(req);
    if (token) {
      const session = this.tokenRegistry.resolve(token);
      if (session?.userId) {
        return { userId: session.userId, roles: (session.roles ?? []) as UserRole[] };
      }
    }

    // 2) Onboarding: resolver desde cookie del flujo de registro.
    const flowId = getCookieValue(req.headers.cookie, REG_FLOW_COOKIE);
    if (!flowId) throw new UnauthorizedException();
    const flow = await this.regFlowStore.getFlow(flowId);
    if (!flow?.userId) throw new UnauthorizedException();

    const user = await this.userRepo.findById(flow.userId);
    if (!user) throw new UnauthorizedException();

    return { userId: flow.userId, roles: (user.roles ?? []) as UserRole[] };
  }

  @Public()
  @PatchMeLocationSwagger()
  @HttpCode(204)
  @Patch('location')
  async updateLocation(@Req() req: RequestWithUser, @Body() body: UpdateLocationRequestDto): Promise<void> {
    const { userId } = await this.resolveUserContext(req);
    await this.updateLocationUseCase.execute({ userId, ...body });
  }

  @Public()
  @PatchMeWorkerProfileSwagger()
  @HttpCode(204)
  @Patch('worker-profile')
  async updateWorkerProfile(
    @Req() req: RequestWithUser,
    @Body() body: UpdateWorkerProfileRequestDto,
  ): Promise<void> {
    const { userId, roles } = await this.resolveUserContext(req);
    await this.updateWorkerProfileUseCase.execute({
      userId,
      actorRoles: roles as any,
      categories: body.categories,
      headline: body.headline,
      bio: body.bio,
    });
  }

  @Public()
  @PatchMeClientProfileSwagger()
  @HttpCode(204)
  @Patch('client-profile')
  async updateClientProfile(
    @Req() req: RequestWithUser,
    @Body() body: UpdateClientProfileRequestDto,
  ): Promise<void> {
    const { userId } = await this.resolveUserContext(req);
    await this.updateClientProfileUseCase.execute({ userId, ...body });
  }

  @Public()
  @PatchMePersonalInfoSwagger()
  @HttpCode(204)
  @Patch('personal-info')
  async updatePersonalInfo(
    @Req() req: RequestWithUser,
    @Body() body: UpdatePersonalInfoRequestDto,
  ): Promise<void> {
    const { userId, roles } = await this.resolveUserContext(req);
    await this.updatePersonalInfoUseCase.execute({
      userId,
      actorRoles: roles as any,
      ...body,
    });
  }
}

