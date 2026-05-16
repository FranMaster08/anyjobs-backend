import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserReelInteractionsService } from './user-reel-interactions.service';
import { UserReelInteractionEntity } from '../infrastructure/entities/user-reel-interaction.entity';
import { UserReelEntity } from '../infrastructure/entities/user-reel.entity';

describe('UserReelInteractionsService', () => {
  let service: UserReelInteractionsService;
  let saved: UserReelInteractionEntity | null;
  let reelExists = true;

  beforeEach(async () => {
    saved = null;
    reelExists = true;

    const moduleRef = await Test.createTestingModule({
      providers: [
        UserReelInteractionsService,
        {
          provide: getRepositoryToken(UserReelInteractionEntity),
          useValue: {
            create: (entity: UserReelInteractionEntity) => entity,
            save: async (entity: UserReelInteractionEntity) => {
              saved = entity;
              return entity;
            },
          },
        },
        {
          provide: getRepositoryToken(UserReelEntity),
          useValue: {
            exist: async () => reelExists,
          },
        },
      ],
    }).compile();

    service = moduleRef.get(UserReelInteractionsService);
  });

  it('persists interaction when reel exists', async () => {
    reelExists = true;

    await service.track({
      kind: 'slideImpression',
      subjectType: 'anonymous',
      reelId: '11111111-1111-1111-1111-111111111111',
    });

    expect(saved?.reelId).toBe('11111111-1111-1111-1111-111111111111');
  });

  it('stores null reelId when reel was deleted but client still sends id', async () => {
    reelExists = false;

    await service.track({
      kind: 'slideViewStart',
      subjectType: 'user',
      userId: '22222222-2222-2222-2222-222222222222',
      reelId: '11111111-1111-1111-1111-111111111111',
    });

    expect(saved?.reelId).toBeNull();
    expect(saved?.payload).toContain('orphanReelId');
  });

  it('skips reel lookup when reelId is absent', async () => {
    const existSpy = jest.fn(async () => true);
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserReelInteractionsService,
        {
          provide: getRepositoryToken(UserReelInteractionEntity),
          useValue: {
            create: (entity: UserReelInteractionEntity) => entity,
            save: async (entity: UserReelInteractionEntity) => entity,
          },
        },
        {
          provide: getRepositoryToken(UserReelEntity),
          useValue: { exist: existSpy },
        },
      ],
    }).compile();

    await moduleRef.get(UserReelInteractionsService).track({
      kind: 'doubleTap',
      subjectType: 'anonymous',
      sliderId: 'home-featured-reels',
    });

    expect(existSpy).not.toHaveBeenCalled();
  });
});
