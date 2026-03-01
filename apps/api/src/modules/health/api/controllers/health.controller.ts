import { Controller, Get } from '@nestjs/common';
import { GetHealthUseCase } from '../../application/use-cases/get-health.use-case';
import { Public } from '../../../../shared/security/public.decorator';
import { RequirePermissions } from '../../../../shared/security/require-permissions.decorator';
import { GetHealthSwagger } from '../swagger/get-health.swagger';
import { GetHealthDenySwagger } from '../swagger/get-health-deny.swagger';
import { GetHealthSecureSwagger } from '../swagger/get-health-secure.swagger';
import { HealthResponseDto } from '../dtos/health-response.dto';

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

