import {
  Body,
  Controller,
  Get,
  HttpCode,
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
  VerifyOtpRequestDto,
} from '../dtos';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { VerifyEmailOtpUseCase } from '../../application/use-cases/verify-email-otp.use-case';
import { VerifyPhoneOtpUseCase } from '../../application/use-cases/verify-phone-otp.use-case';
import { CheckEmailAvailableUseCase } from '../../application/use-cases/check-email-available.use-case';
import { CheckPhoneAvailableUseCase } from '../../application/use-cases/check-phone-available.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
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
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterResponseDto> {
    this.logger.log('Register request received');
    const result = await this.registerUseCase.execute(body);

    const isProd = (this.configService.get<string>('app.nodeEnv') ?? 'development') === 'production';
    res.cookie(REG_FLOW_COOKIE, encodeURIComponent(result.flowId), {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      // Debe aplicarse a todo el flujo de onboarding (ej. /users/me/location)
      path: '/',
    });

    return {
      userId: result.userId,
      status: result.status,
      emailVerificationRequired: result.emailVerificationRequired,
      phoneVerificationRequired: result.phoneVerificationRequired,
      nextStage: result.nextStage,
    };
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

