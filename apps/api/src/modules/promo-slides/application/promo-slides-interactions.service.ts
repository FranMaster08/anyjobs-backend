import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackPromoInteractionDto } from '../api/dto/track-promo-interaction.dto';
import { PromoSlideInteractionEntity } from '../infrastructure/entities/promo-slide-interaction.entity';

const KNOWN_ROOT_KEYS = new Set([
  'kind',
  'sliderId',
  'route',
  'slideIndex',
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
export class PromoSlidesInteractionsService {
  constructor(
    @InjectRepository(PromoSlideInteractionEntity)
    private readonly repo: Repository<PromoSlideInteractionEntity>,
  ) {}

  async track(dto: TrackPromoInteractionDto): Promise<void> {
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
    if (dto.active !== undefined) extra.active = dto.active;
    if (dto.count !== undefined) extra.count = dto.count;
    if (dto.following !== undefined) extra.following = dto.following;
    if (dto.final !== undefined) extra.final = dto.final;
    if (dto.userRoles !== undefined) extra.userRoles = dto.userRoles;

    const entity = this.repo.create({
      kind: dto.kind,
      sliderId: dto.sliderId ?? null,
      route: dto.route ?? null,
      slideIndex: dto.slideIndex ?? null,
      campaignId: dto.campaignId ?? null,
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
