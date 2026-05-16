import { AppException } from '../../../../shared/errors/app-exception';
import { UpdateLocationUseCase } from './update-location.use-case';

describe(UpdateLocationUseCase.name, () => {
  it('updates location', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue({ id: 'u1' }),
      update: jest.fn().mockResolvedValue(undefined),
    } as any;
    const uc = new UpdateLocationUseCase(repo);
    await uc.execute({
      userId: 'u1',
      city: 'Ciudad Autónoma de Buenos Aires',
      municipality: 'Ciudad Autónoma de Buenos Aires',
      area: 'Palermo',
      countryCode: 'AR',
    });
    expect(repo.update).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({
        city: 'Ciudad Autónoma de Buenos Aires',
        municipality: 'Ciudad Autónoma de Buenos Aires',
        countryCode: 'AR',
      }),
    );
  });

  it('throws USER.NOT_FOUND when missing', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) } as any;
    const uc = new UpdateLocationUseCase(repo);
    await expect(
      uc.execute({ userId: 'x', city: 'Bogotá D.C.', municipality: 'Bogotá', area: 'Centro', countryCode: 'CO' }),
    ).rejects.toBeInstanceOf(AppException);
  });
});

