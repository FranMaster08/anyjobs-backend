import { AppException } from '../../../../shared/errors/app-exception';
import { UpdatePersonalInfoUseCase } from './update-personal-info.use-case';

describe(UpdatePersonalInfoUseCase.name, () => {
  it('updates personal info', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue({ id: 'u1' }),
      update: jest.fn().mockResolvedValue(undefined),
    } as any;
    const uc = new UpdatePersonalInfoUseCase(repo);
    await uc.execute({
      userId: 'u1',
      actorRoles: ['WORKER'],
      documentType: 'DNI',
      documentNumber: '12345',
      birthDate: '1990-01-01',
    });
    expect(repo.update).toHaveBeenCalled();
  });

  it('throws when user missing', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) } as any;
    const uc = new UpdatePersonalInfoUseCase(repo);
    await expect(
      uc.execute({
        userId: 'x',
        actorRoles: ['WORKER'],
        documentType: 'DNI',
        documentNumber: '12345',
        birthDate: '1990-01-01',
      }),
    ).rejects.toBeInstanceOf(AppException);
  });
});

