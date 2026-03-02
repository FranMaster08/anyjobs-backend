import { AppException } from '../../../../shared/errors/app-exception';
import { UpdateWorkerProfileUseCase } from './update-worker-profile.use-case';

describe(UpdateWorkerProfileUseCase.name, () => {
  it('requires categories for WORKER', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue({ id: 'u1' }),
      update: jest.fn(),
    } as any;
    const uc = new UpdateWorkerProfileUseCase(repo);

    await expect(
      uc.execute({ userId: 'u1', actorRoles: ['WORKER'], categories: [] }),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('updates worker profile', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue({ id: 'u1' }),
      update: jest.fn().mockResolvedValue(undefined),
    } as any;
    const uc = new UpdateWorkerProfileUseCase(repo);

    await uc.execute({ userId: 'u1', actorRoles: ['WORKER'], categories: ['Limpieza'], headline: 'h' });
    expect(repo.update).toHaveBeenCalled();
  });
});

