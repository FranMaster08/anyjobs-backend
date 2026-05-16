import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackUserReelInteractionDto } from '../api/dto/track-user-reel-interaction.dto';
import { UserReelEntity } from '../infrastructure/entities/user-reel.entity';
import { UserReelInteractionEntity } from '../infrastructure/entities/user-reel-interaction.entity';

const KNOWN_ROOT_KEYS = new Set([
  'kind',
  'sliderId',
  'route',
  'slideIndex',
  'reelId',
  'campaignId',
  'slideMedia',
  'subjectType',
  'userId',
  'anonymousId',
  'emittedAt',
  'payload',
  'action',
  'muted',
  'watchMs',
  'mediaDurationMs',
  'completionRate',
  'viewDurationMs',
]);

@Injectable()
export class UserReelInteractionsService {
  constructor(
    @InjectRepository(UserReelInteractionEntity)
    private readonly repo: Repository<UserReelInteractionEntity>,
    @InjectRepository(UserReelEntity)
    private readonly reels: Repository<UserReelEntity>,
  ) {}

  async track(dto: TrackUserReelInteractionDto): Promise<void> {
    const emittedAt = dto.emittedAt ? new Date(dto.emittedAt) : new Date();
    const extra: Record<string, unknown> = { ...(dto.payload ?? {}) };

    for (const [key, value] of Object.entries(dto)) {
      if (KNOWN_ROOT_KEYS.has(key) || value === undefined) continue;
      extra[key] = value;
    }
    if (dto.action !== undefined) extra.action = dto.action;
    if (dto.muted !== undefined) extra.muted = dto.muted;
    if (dto.watchMs !== undefined) extra.watchMs = dto.watchMs;
    if (dto.mediaDurationMs !== undefined) extra.mediaDurationMs = dto.mediaDurationMs;
    if (dto.completionRate !== undefined) extra.completionRate = dto.completionRate;
    if (dto.viewDurationMs !== undefined) extra.viewDurationMs = dto.viewDurationMs;

    let reelId = dto.reelId ?? dto.campaignId ?? null;
    if (reelId) {
      const reelExists = await this.reels.exist({ where: { id: reelId } });
      if (!reelExists) {
        extra.orphanReelId = reelId;
        reelId = null;
      }
    }

    const entity = this.repo.create({
      kind: dto.kind,
      sliderId: dto.sliderId ?? null,
      route: dto.route ?? null,
      slideIndex: dto.slideIndex ?? null,
      reelId,
      slideMedia: dto.slideMedia ?? null,
      subjectType: dto.subjectType,
      userId: dto.subjectType === 'user' && dto.userId ? dto.userId : null,
      anonymousId: dto.anonymousId ?? null,
      emittedAt,
      payload: Object.keys(extra).length > 0 ? JSON.stringify(extra) : null,
    });

    await this.repo.save(entity);
  }
}
