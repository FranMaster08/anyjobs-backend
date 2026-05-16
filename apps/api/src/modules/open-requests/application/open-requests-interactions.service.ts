import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackOpenRequestInteractionDto } from '../api/dto/track-open-request-interaction.dto';
import { OpenRequestInteractionEntity } from '../infrastructure/entities/open-request-interaction.entity';

const KNOWN_ROOT_KEYS = new Set([
  'kind',
  'openRequestId',
  'route',
  'listPage',
  'subjectType',
  'userId',
  'anonymousId',
  'emittedAt',
  'payload',
  'viewDurationMs',
]);

@Injectable()
export class OpenRequestsInteractionsService {
  constructor(
    @InjectRepository(OpenRequestInteractionEntity)
    private readonly repo: Repository<OpenRequestInteractionEntity>,
  ) {}

  async track(dto: TrackOpenRequestInteractionDto): Promise<void> {
    const emittedAt = dto.emittedAt ? new Date(dto.emittedAt) : new Date();
    const extra: Record<string, unknown> = { ...(dto.payload ?? {}) };

    for (const [key, value] of Object.entries(dto)) {
      if (KNOWN_ROOT_KEYS.has(key) || value === undefined) continue;
      extra[key] = value;
    }
    if (dto.viewDurationMs !== undefined) extra.viewDurationMs = dto.viewDurationMs;

    const entity = this.repo.create({
      kind: dto.kind,
      openRequestId: dto.openRequestId,
      route: dto.route ?? null,
      listPage: dto.listPage ?? null,
      subjectType: dto.subjectType,
      userId: dto.subjectType === 'user' && dto.userId ? dto.userId : null,
      anonymousId: dto.anonymousId ?? null,
      emittedAt,
      payload: Object.keys(extra).length > 0 ? JSON.stringify(extra) : null,
    });

    await this.repo.save(entity);
  }
}
