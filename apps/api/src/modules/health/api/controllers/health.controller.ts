import { Controller, Get } from '@nestjs/common';
import { GetHealthUseCase } from '../../application/use-cases/get-health.use-case';
import { Public } from '../../../../shared/security/public.decorator';
import { RequirePermissions } from '../../../../shared/security/require-permissions.decorator';
import { GetHealthDenySwagger, GetHealthSecureSwagger, GetHealthSwagger } from '../swagger';
import { HealthResponseDto } from '../dtos';

@Controller('health')
export class HealthController {
  constructor(private readonly getHealthUseCase: GetHealthUseCase) {}

  @Public()
  @GetHealthSwagger()
  @Get()
  getHealth(): HealthResponseDto {
    return this.getHealthUseCase.execute();
  }

  @RequirePermissions('health.read')
  @GetHealthSecureSwagger()
  @Get('secure')
  getHealthSecure(): HealthResponseDto {
    return this.getHealthUseCase.execute();
  }

  // Intencionalmente sin @Public y sin metadata RBAC.
  @GetHealthDenySwagger()
  @Get('deny')
  getHealthDenyByDefault(): HealthResponseDto {
    return this.getHealthUseCase.execute();
  }
}

