import { CheckPhoneAvailableUseCase } from './check-phone-available.use-case';

describe(CheckPhoneAvailableUseCase.name, () => {
  it('returns available=true when phone is not used', async () => {
    const userRepo = { findByPhoneNumber: jest.fn().mockResolvedValue(null) } as any;
    const uc = new CheckPhoneAvailableUseCase(userRepo);
    await expect(uc.execute({ phoneNumber: '+34000' })).resolves.toEqual({ available: true });
  });
});

