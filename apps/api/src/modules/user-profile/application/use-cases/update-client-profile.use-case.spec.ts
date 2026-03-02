import { AppException } from '../../../../shared/errors/app-exception';
import { UpdateClientProfileUseCase } from './update-client-profile.use-case';

describe(UpdateClientProfileUseCase.name, () => {
  it('updates preferredPaymentMethod', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue({ id: 'u1' }),
      update: jest.fn().mockResolvedValue(undefined),
    } as any;
    const uc = new UpdateClientProfileUseCase(repo);
    await uc.execute({ userId: 'u1', preferredPaymentMethod: 'CARD' });
    expect(repo.update).toHaveBeenCalledWith('u1', { preferredPaymentMethod: 'CARD' });
  });

  it('throws when user missing', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) } as any;
    const uc = new UpdateClientProfileUseCase(repo);
    await expect(uc.execute({ userId: 'x', preferredPaymentMethod: 'CARD' })).rejects.toBeInstanceOf(
      AppException,
    );
  });
});

