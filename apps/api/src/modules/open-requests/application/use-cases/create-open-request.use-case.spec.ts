import { ConfigService } from '@nestjs/config';
import { AppException } from '../../../../shared/errors/app-exception';
import type { OpenRequestDetail } from '../../domain';
import { CreateOpenRequestUseCase } from './create-open-request.use-case';

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
function buildDetail(): OpenRequestDetail {
  return {
    id: 'req-1',
    title: 'Titulo',
    excerpt: 'Resumen',
    description: 'Descripcion',
    tags: ['tag'],
    locationLabel: 'Locacion',
    publishedAtLabel: 'Hoy',
    budgetLabel: '$10',
    provider: { name: 'Cliente', badge: 'NUEVO', subtitle: 'Solicitud publicada' },
    reputation: 0,
    reviewsCount: 0,
    providerReviews: [],
    contactPhone: '+34000000000',
    contactEmail: 'test@example.com',
    images: [{ url: '/uploads/open-request-images/a.jpg', alt: 'a.jpg' }],
  };
}

describe('CreateOpenRequestUseCase', () => {
  it('fails when total images is greater than 6 and compensates uploaded files', async () => {
    const repo = {
      create: jest.fn(),
      replaceImages: jest.fn(),
      getById: jest.fn(),
    } as any;
    const storage = {
      save: jest
        .fn()
        .mockResolvedValueOnce({ storageKey: 's1', url: '/uploads/open-request-images/s1.jpg' })
        .mockResolvedValueOnce({ storageKey: 's2', url: '/uploads/open-request-images/s2.jpg' }),
      delete: jest.fn().mockResolvedValue(undefined),
      resolveUrl: jest.fn(),
    } as any;
    const useCase = new CreateOpenRequestUseCase(repo, storage, mockConfig());

    await expect(
      useCase.execute({
        ownerUserId: 'u1',
        title: 't',
        excerpt: 'e',
        description: 'd',
        tags: ['a'],
        locationLabel: 'l',
        budgetLabel: 'b',
        contactPhone: 'p',
        contactEmail: 'c@example.com',
        images: [
          { url: '1', alt: '1' },
          { url: '2', alt: '2' },
          { url: '3', alt: '3' },
          { url: '4', alt: '4' },
          { url: '5', alt: '5' },
        ],
        uploadedImages: [
          { bytes: Buffer.from('a'), mimeType: 'image/jpeg', originalName: 'a.jpg' },
          { bytes: Buffer.from('b'), mimeType: 'image/jpeg', originalName: 'b.jpg' },
        ],
      }),
    ).rejects.toBeInstanceOf(AppException);

    expect(storage.delete).toHaveBeenCalledWith('s1');
    expect(storage.delete).toHaveBeenCalledWith('s2');
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('creates request and persists image records', async () => {
    const created = buildDetail();
    const repo = {
      create: jest.fn().mockResolvedValue(created),
      replaceImages: jest.fn().mockResolvedValue(undefined),
      getById: jest.fn().mockResolvedValue(created),
    } as any;
    const storage = {
      save: jest.fn().mockResolvedValue({ storageKey: 's1', url: '/uploads/open-request-images/s1.jpg' }),
      delete: jest.fn().mockResolvedValue(undefined),
      resolveUrl: jest.fn(),
    } as any;
    const useCase = new CreateOpenRequestUseCase(repo, storage, mockConfig());

    const result = await useCase.execute({
      ownerUserId: 'u1',
      title: 't',
      excerpt: 'e',
      description: 'd',
      tags: ['a'],
      locationLabel: 'l',
      budgetLabel: 'b',
      contactPhone: 'p',
      contactEmail: 'c@example.com',
      images: [],
      uploadedImages: [{ bytes: Buffer.from('a'), mimeType: 'image/jpeg', originalName: 'a.jpg' }],
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: 'http://localhost:3000/uploads/open-request-images/s1.jpg',
        images: [{ url: 'http://localhost:3000/uploads/open-request-images/s1.jpg', alt: 'a.jpg' }],
      }),
    );
    expect(repo.replaceImages).toHaveBeenCalled();
    expect(result).toEqual(created);
  });
});
