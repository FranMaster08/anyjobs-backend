import { UnauthorizedException } from '@nestjs/common';
import { CorrelationIdService } from '../../../../shared/correlation/correlation-id.service';
import { VerifyEmailOtpUseCase } from './verify-email-otp.use-case';

describe(VerifyEmailOtpUseCase.name, () => {
  const correlationIdService = new CorrelationIdService();
  const configService = { get: () => false } as any;

  it('throws 401 when flow is missing', async () => {
    const flowStore = { getFlow: jest.fn().mockResolvedValue(null) } as any;
    const uc = new VerifyEmailOtpUseCase(flowStore, correlationIdService, configService);

    await expect(uc.execute({ flowId: 'missing', otpCode: '123' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('marks emailVerified true', async () => {
    const flowStore = {
      getFlow: jest.fn().mockResolvedValue({ flowId: 'f1' }),
      updateFlow: jest.fn().mockResolvedValue(undefined),
    } as any;
    const uc = new VerifyEmailOtpUseCase(flowStore, correlationIdService, configService);

    await uc.execute({ flowId: 'f1', otpCode: '123' });
    expect(flowStore.updateFlow).toHaveBeenCalledWith('f1', { emailVerified: true });
  });
});

