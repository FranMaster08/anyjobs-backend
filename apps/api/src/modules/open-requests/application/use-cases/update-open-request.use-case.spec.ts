import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppException } from '../../../../shared/errors/app-exception';
import { UpdateOpenRequestUseCase } from './update-open-request.use-case';

function mockConfig(): ConfigService {
  return {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'app') {
        return { nodeEnv: 'test', port: 3000, publicUrl: 'http://localhost:3000' };
      }
      throw new Error(`unexpected config key: ${key}`);
    }),
  } as unknown as ConfigService;
}

describe('UpdateOpenRequestUseCase', () => {
  it('rejects when result leaves zero images', async () => {
    const repo = {
      findOwnerId: jest.fn().mockResolvedValue({ ownerUserId: 'u1' }),
      listImageRecords: jest.fn().mockResolvedValue([]),
      getById: jest.fn().mockResolvedValue({
        id: 'req-1',
        images: [],
      }),
      updatePartial: jest.fn(),
      replaceImages: jest.fn(),
    } as any;
    const storage = { save: jest.fn(), delete: jest.fn().mockResolvedValue(undefined) } as any;
    const useCase = new UpdateOpenRequestUseCase(repo, storage, mockConfig());

    await expect(
      useCase.execute({
        id: 'req-1',
        userId: 'u1',
        patch: { images: [] },
      }),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('rejects image mutation when foreign ownership exists', async () => {
    const repo = {
      findOwnerId: jest.fn().mockResolvedValue({ ownerUserId: 'u1' }),
      listImageRecords: jest.fn().mockResolvedValue([{ ownerUserId: 'u2', url: 'x', alt: 'x', storageKey: null }]),
      getById: jest.fn().mockResolvedValue({ id: 'req-1', images: [{ url: 'x', alt: 'x' }] }),
      updatePartial: jest.fn(),
      replaceImages: jest.fn(),
    } as any;
    const storage = { save: jest.fn(), delete: jest.fn().mockResolvedValue(undefined) } as any;
    const useCase = new UpdateOpenRequestUseCase(repo, storage, mockConfig());

    await expect(
      useCase.execute({
        id: 'req-1',
        userId: 'u1',
        patch: { images: [{ url: 'y', alt: 'y' }] },
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
