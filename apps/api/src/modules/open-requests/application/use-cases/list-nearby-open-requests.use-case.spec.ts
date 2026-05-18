import { ListNearbyOpenRequestsUseCase } from './list-nearby-open-requests.use-case';
import type { OpenRequestsRepositoryPort } from '../ports';
import type { NearbyOpenRequestItem } from '../../domain';

describe('ListNearbyOpenRequestsUseCase', () => {
  const barcelona: NearbyOpenRequestItem = {
    id: 'near-1',
    imageUrl: '',
    imageAlt: '',
    excerpt: 'A',
    tags: [],
    locationLabel: 'Barcelona',
    locationLat: 41.39,
    locationLng: 2.17,
    publishedAtLabel: 'Hoy',
    budgetLabel: '€1',
    publishedAtSort: 1,
    distanceKm: 1,
  };

  const repo: OpenRequestsRepositoryPort = {
    listNearby: jest.fn().mockResolvedValue([barcelona]),
    list: jest.fn(),
    listByOwner: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    updatePartial: jest.fn(),
    listImageRecords: jest.fn(),
    replaceImages: jest.fn(),
    softDelete: jest.fn(),
    findOwnerId: jest.fn(),
  };

  it('rejects missing coordinates', async () => {
    const uc = new ListNearbyOpenRequestsUseCase(repo);
    await expect(uc.execute({})).rejects.toMatchObject({ errorCode: 'VALIDATION.INVALID_INPUT' });
  });

  it('caps limit at 100', async () => {
    const uc = new ListNearbyOpenRequestsUseCase(repo);
    await uc.execute({ lat: 41.38, lng: 2.17, limit: 500 });
    expect(repo.listNearby).toHaveBeenCalledWith(expect.objectContaining({ limit: 100 }));
  });

  it('returns items from repository', async () => {
    const uc = new ListNearbyOpenRequestsUseCase(repo);
    const res = await uc.execute({ lat: 41.38, lng: 2.17 });
    expect(res.items).toEqual([barcelona]);
  });
});
