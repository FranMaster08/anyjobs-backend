import { CheckEmailAvailableUseCase } from './check-email-available.use-case';

describe(CheckEmailAvailableUseCase.name, () => {
  it('returns available=true when email is not used', async () => {
    const userRepo = { findByEmail: jest.fn().mockResolvedValue(null) } as any;
    const uc = new CheckEmailAvailableUseCase(userRepo);
    await expect(uc.execute({ email: 'a@b.com' })).resolves.toEqual({ available: true });
  });
});

