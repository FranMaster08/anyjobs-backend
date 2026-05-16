import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { CorrelationIdService } from '../../../../shared/correlation/correlation-id.service';
import { createAppLogger } from '../../../../shared/logging/app-logger';
import { Public } from '../../../../shared/security/public.decorator';
import { getCookieValue } from '../../../../shared/http/cookies';
import {
  EmailAvailableResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  PhoneAvailableResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  RegistrationStatusResponseDto,
  VerifyOtpRequestDto,
  CompleteOnboardingRegistrationRequestDto,
} from '../dtos';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { VerifyEmailOtpUseCase } from '../../application/use-cases/verify-email-otp.use-case';
import { VerifyPhoneOtpUseCase } from '../../application/use-cases/verify-phone-otp.use-case';
import { CheckEmailAvailableUseCase } from '../../application/use-cases/check-email-available.use-case';
import { CheckPhoneAvailableUseCase } from '../../application/use-cases/check-phone-available.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { UpdateRegistrationLocationUseCase } from '../../application/use-cases/update-registration-location.use-case';
import { UpdateRegistrationWorkerProfileUseCase } from '../../application/use-cases/update-registration-worker-profile.use-case';
import { UpdateRegistrationClientProfileUseCase } from '../../application/use-cases/update-registration-client-profile.use-case';
import { UpdateRegistrationPersonalInfoUseCase } from '../../application/use-cases/update-registration-personal-info.use-case';
import { CompleteRegistrationUseCase } from '../../application/use-cases/complete-registration.use-case';
import { CompleteOnboardingRegistrationUseCase } from '../../application/use-cases/complete-onboarding-registration.use-case';
import { GetRegistrationStatusUseCase } from '../../application/use-cases/get-registration-status.use-case';
import { GetLocationCatalogUseCase } from '../../application/use-cases/get-location-catalog.use-case';
import {
  UpdateClientProfileRequestDto,
  UpdateLocationRequestDto,
  UpdatePersonalInfoRequestDto,
  UpdateWorkerProfileRequestDto,
} from '../../../user-profile/api/dtos';
import {
  GetEmailAvailableSwagger,
  GetPhoneAvailableSwagger,
  PostLoginSwagger,
  PostRegisterSwagger,
  PostVerifyEmailSwagger,
  PostVerifyPhoneSwagger,
} from '../swagger';

const REG_FLOW_COOKIE = 'aj_reg_flow';

@ApiTags('Auth')
@Public()
@Controller('auth')
export class AuthController {
  private readonly logger;

  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly verifyEmailOtpUseCase: VerifyEmailOtpUseCase,
    private readonly verifyPhoneOtpUseCase: VerifyPhoneOtpUseCase,
    private readonly checkEmailAvailableUseCase: CheckEmailAvailableUseCase,
    private readonly checkPhoneAvailableUseCase: CheckPhoneAvailableUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly updateRegistrationLocationUseCase: UpdateRegistrationLocationUseCase,
    private readonly updateRegistrationWorkerProfileUseCase: UpdateRegistrationWorkerProfileUseCase,
    private readonly updateRegistrationClientProfileUseCase: UpdateRegistrationClientProfileUseCase,
    private readonly updateRegistrationPersonalInfoUseCase: UpdateRegistrationPersonalInfoUseCase,
    private readonly completeRegistrationUseCase: CompleteRegistrationUseCase,
    private readonly completeOnboardingRegistrationUseCase: CompleteOnboardingRegistrationUseCase,
    private readonly getRegistrationStatusUseCase: GetRegistrationStatusUseCase,
    private readonly getLocationCatalogUseCase: GetLocationCatalogUseCase,
    correlationIdService: CorrelationIdService,
    private readonly configService: ConfigService,
  ) {
    const debugPayloads = this.configService.get<boolean>('logging.debugPayloads') ?? false;
    this.logger = createAppLogger(AuthController.name, correlationIdService, debugPayloads);
  }

  @Public()
  @PostRegisterSwagger()
  @HttpCode(200)
  @Post('register')
  async register(
    @Body() body: RegisterRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterResponseDto> {
    this.logger.log('Register request received');
    const resumeFlowId = getCookieValue(req.headers.cookie, REG_FLOW_COOKIE);
    const result = await this.registerUseCase.execute({
      ...body,
      resumeFlowId: resumeFlowId ?? undefined,
    });

    const isProd = (this.configService.get<string>('app.nodeEnv') ?? 'development') === 'production';
    res.cookie(REG_FLOW_COOKIE, encodeURIComponent(result.flowId), {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      // Debe aplicarse a todo el flujo de onboarding (ej. /users/me/location)
      path: '/',
    });

    return {
      status: result.status,
      emailVerificationRequired: result.emailVerificationRequired,
      phoneVerificationRequired: result.phoneVerificationRequired,
      nextStage: result.nextStage,
      resumed: result.resumed,
    };
  }

  @Public()
  @HttpCode(200)
  @Get('registration/status')
  async registrationStatus(@Req() req: Request): Promise<RegistrationStatusResponseDto> {
    const flowId = getCookieValue(req.headers.cookie, REG_FLOW_COOKIE);
    if (!flowId) {
      return { active: false };
    }
    return this.getRegistrationStatusUseCase.execute({ flowId });
  }

  @Public()
  @PostVerifyEmailSwagger()
  @HttpCode(204)
  @Post('verify-email')
  async verifyEmail(@Body() body: VerifyOtpRequestDto, @Req() req: Request): Promise<void> {
    const flowId = getCookieValue(req.headers.cookie, REG_FLOW_COOKIE);
    if (!flowId) throw new UnauthorizedException();
    await this.verifyEmailOtpUseCase.execute({ flowId, otpCode: body.otpCode });
  }

  @Public()
  @PostVerifyPhoneSwagger()
  @HttpCode(204)
  @Post('verify-phone')
  async verifyPhone(@Body() body: VerifyOtpRequestDto, @Req() req: Request): Promise<void> {
    const flowId = getCookieValue(req.headers.cookie, REG_FLOW_COOKIE);
    if (!flowId) throw new UnauthorizedException();
    await this.verifyPhoneOtpUseCase.execute({ flowId, otpCode: body.otpCode });
  }

  @Public()
  @HttpCode(204)
  @Patch('registration/location')
  async updateRegistrationLocation(@Req() req: Request, @Body() body: UpdateLocationRequestDto): Promise<void> {
    const flowId = getCookieValue(req.headers.cookie, REG_FLOW_COOKIE);
    if (!flowId) throw new UnauthorizedException();
    await this.updateRegistrationLocationUseCase.execute({ flowId, ...body });
  }

  @Public()
  @HttpCode(204)
  @Patch('registration/worker-profile')
  async updateRegistrationWorkerProfile(
    @Req() req: Request,
    @Body() body: UpdateWorkerProfileRequestDto,
  ): Promise<void> {
    const flowId = getCookieValue(req.headers.cookie, REG_FLOW_COOKIE);
    if (!flowId) throw new UnauthorizedException();
    await this.updateRegistrationWorkerProfileUseCase.execute({ flowId, ...body });
  }

  @Public()
  @HttpCode(204)
  @Patch('registration/client-profile')
  async updateRegistrationClientProfile(
    @Req() req: Request,
    @Body() body: UpdateClientProfileRequestDto,
  ): Promise<void> {
    const flowId = getCookieValue(req.headers.cookie, REG_FLOW_COOKIE);
    if (!flowId) throw new UnauthorizedException();
    await this.updateRegistrationClientProfileUseCase.execute({ flowId, ...body });
  }

  @Public()
  @HttpCode(204)
  @Patch('registration/personal-info')
  async updateRegistrationPersonalInfo(
    @Req() req: Request,
    @Body() body: UpdatePersonalInfoRequestDto,
  ): Promise<void> {
    const flowId = getCookieValue(req.headers.cookie, REG_FLOW_COOKIE);
    if (!flowId) throw new UnauthorizedException();
    await this.updateRegistrationPersonalInfoUseCase.execute({ flowId, ...body });
  }

  @Public()
  @HttpCode(204)
  @Post('registration/complete')
  async completeRegistration(@Req() req: Request): Promise<void> {
    const flowId = getCookieValue(req.headers.cookie, REG_FLOW_COOKIE);
    if (!flowId) throw new UnauthorizedException();
    await this.completeRegistrationUseCase.execute({ flowId });
  }

  @Public()
  @HttpCode(204)
  @Post('register/complete')
  async completeOnboardingRegistration(@Body() body: CompleteOnboardingRegistrationRequestDto): Promise<void> {
    await this.completeOnboardingRegistrationUseCase.execute({
      account: body.account,
      emailVerified: body.emailVerified,
      phoneVerified: body.phoneVerified,
      location: body.location,
      workerProfile: body.workerProfile,
      preferredPaymentMethod: body.preferredPaymentMethod,
      personalInfo: body.personalInfo,
    });
  }

  @Public()
  @Get('location-catalog')
  async locationCatalog(
    @Query('countryCode') countryCode?: string,
    @Query('division') division?: string,
  ) {
    const code = countryCode?.trim().toUpperCase();
    const divisionName = division?.trim();

    if (code && divisionName) {
      const municipalities = await this.getLocationCatalogUseCase.executeMunicipalitiesByDivision(
        code,
        divisionName,
      );
      return { countryCode: code, division: divisionName, municipalities };
    }

    if (code) {
      const divisions = await this.getLocationCatalogUseCase.executeDivisionsByCountry(code);
      return { countryCode: code, divisions };
    }

    return this.getLocationCatalogUseCase.execute();
  }

  @Public()
  @GetEmailAvailableSwagger()
  @Get('email-available')
  async emailAvailable(@Query('email') email: string): Promise<EmailAvailableResponseDto> {
    return this.checkEmailAvailableUseCase.execute({ email });
  }

  @Public()
  @GetPhoneAvailableSwagger()
  @Get('phone-available')
  async phoneAvailable(@Query('phoneNumber') phoneNumber: string): Promise<PhoneAvailableResponseDto> {
    return this.checkPhoneAvailableUseCase.execute({ phoneNumber });
  }

  @Public()
  @PostLoginSwagger()
  @HttpCode(200)
  @Post('login')
  async login(@Body() body: LoginRequestDto): Promise<LoginResponseDto> {
    const result = await this.loginUseCase.execute(body);
    return result as unknown as LoginResponseDto;
  }
}

