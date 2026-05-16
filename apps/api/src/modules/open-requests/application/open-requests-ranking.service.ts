import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buildPageMeta } from '../../../shared/application/pagination/page-result';
import type { PageRequest } from '../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../shared/application/pagination/page-result';
import type { OpenRequestListItem } from '../domain/open-request';
import { OpenRequestEntity } from '../infrastructure/entities/open-request.entity';
import { OpenRequestInteractionEntity } from '../infrastructure/entities/open-request-interaction.entity';
import { ProposalEntity } from '../../proposals/infrastructure/entities/proposal.entity';
import {
  OpenRequestsEngagementMetricsService,
  type OpenRequestEngagementMetricsRow,
} from './open-requests-engagement-metrics.service';
import {
  interactionUserIdWhereSql,
  openRequestInteractionJoinSql,
  userIdEqualsParamSql,
} from './open-requests-query-sql';

export interface OpenRequestsFeedActor {
  userId?: string | null;
  anonymousId?: string | null;
}

export interface ListOpenRequestsRankedResult extends PageResult<OpenRequestListItem> {
  nextPage: number | null;
  hasMore: boolean;
}

const WEIGHTS = {
  freshness: 0.35,
  engagement: 0.4,
  relationship: 0.15,
  tagAffinity: 0.1,
} as const;

const ENGAGEMENT_INNER = {
  ctr: 0.3,
  detailRate: 0.4,
  proposalRate: 0.2,
  timeOnDetail: 0.1,
} as const;

const COLD_START_IMPRESSIONS = 5;
const RELATIONSHIP_PROPOSAL_BOOST = 1;
const RELATIONSHIP_VIEW_BOOST = 0.6;

@Injectable()
export class OpenRequestsRankingService {
  constructor(
    @InjectRepository(OpenRequestEntity)
    private readonly requests: Repository<OpenRequestEntity>,
    @InjectRepository(OpenRequestInteractionEntity)
    private readonly interactions: Repository<OpenRequestInteractionEntity>,
    @InjectRepository(ProposalEntity)
    private readonly proposals: Repository<ProposalEntity>,
    private readonly metricsService: OpenRequestsEngagementMetricsService,
  ) {}

  async listRanked(
    pageRequest: PageRequest,
    actor: OpenRequestsFeedActor = {},
  ): Promise<ListOpenRequestsRankedResult> {
    const all = await this.requests.find({
      order: { publishedAtSort: 'DESC' as const, id: 'ASC' as const },
    });

    if (all.length === 0) {
      const meta = buildPageMeta(0, pageRequest.page, pageRequest.pageSize);
      return {
        items: [],
        meta,
        nextPage: null,
        hasMore: false,
      };
    }

    const metricsList = await this.metricsService.listMetrics();
    const metricsById = new Map(metricsList.map((m) => [m.openRequestId, m]));
    const seenIds = await this.seenRequestIds(actor);
    const ownerBoost = await this.ownerRelationshipBoost(actor);
    const tagInterests = await this.actorTagInterests(actor);

    const maxPublished = Math.max(...all.map((r) => Number(r.publishedAtSort) || 0), 1);

    const scored = all.map((entity) => {
      const metrics = metricsById.get(entity.id);
      const score = this.computeScore(
        entity,
        metrics,
        maxPublished,
        ownerBoost.get(entity.ownerUserId ?? '') ?? 0,
        this.tagAffinityScore(entity.tags ?? [], tagInterests),
      );

      return {
        entity,
        score,
        deprioritize: seenIds.has(entity.id),
      };
    });

    scored.sort((a, b) => {
      if (a.deprioritize !== b.deprioritize) return a.deprioritize ? 1 : -1;
      if (b.score !== a.score) return b.score - a.score;
      const pubDiff = Number(b.entity.publishedAtSort) - Number(a.entity.publishedAtSort);
      if (pubDiff !== 0) return pubDiff;
      return a.entity.id.localeCompare(b.entity.id);
    });

    const totalItems = scored.length;
    const meta = buildPageMeta(totalItems, pageRequest.page, pageRequest.pageSize);
    const start = (meta.page - 1) * meta.pageSize;
    const pageSlice = scored.slice(start, start + meta.pageSize);

    return {
      items: pageSlice.map(({ entity }) => this.toListItem(entity)),
      meta,
      nextPage: meta.hasNextPage ? meta.page + 1 : null,
      hasMore: meta.hasNextPage,
    };
  }

  private computeScore(
    entity: OpenRequestEntity,
    metrics: OpenRequestEngagementMetricsRow | undefined,
    maxPublished: number,
    relationshipBoost: number,
    tagAffinity: number,
  ): number {
    const freshnessNorm = (Number(entity.publishedAtSort) || 0) / maxPublished;

    if (!metrics || metrics.impressions < COLD_START_IMPRESSIONS) {
      return freshnessNorm * WEIGHTS.freshness;
    }

    const imp = Math.max(metrics.impressions, 1);
    const ctr = metrics.cardClicks / imp;
    const detailRate = metrics.detailViews / imp;
    const proposalRate = metrics.proposalsStarted / Math.max(metrics.detailViews, 1);
    const timeNorm = Math.min(metrics.avgTimeOnDetailMs / 60_000, 1);

    const engagement =
      ctr * ENGAGEMENT_INNER.ctr +
      detailRate * ENGAGEMENT_INNER.detailRate +
      proposalRate * ENGAGEMENT_INNER.proposalRate +
      timeNorm * ENGAGEMENT_INNER.timeOnDetail;

    return (
      freshnessNorm * WEIGHTS.freshness +
      engagement * WEIGHTS.engagement +
      relationshipBoost * WEIGHTS.relationship +
      tagAffinity * WEIGHTS.tagAffinity
    );
  }

  private tagAffinityScore(tags: string[], interests: Set<string>): number {
    if (interests.size === 0 || tags.length === 0) return 0;
    const normalized = tags.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0);
    if (normalized.length === 0) return 0;
    const matches = normalized.filter((t) => interests.has(t)).length;
    return matches / normalized.length;
  }

  private async seenRequestIds(actor: OpenRequestsFeedActor): Promise<Set<string>> {
    const qb = this.interactions
      .createQueryBuilder('i')
      .select('DISTINCT i.open_request_id', 'openRequestId')
      .where('i.kind IN (:...kinds)', {
        kinds: ['requestListImpression', 'requestDetailView', 'requestCardClick'],
      });

    if (actor.userId) {
      qb.andWhere(interactionUserIdWhereSql('i'), { userId: actor.userId });
    } else if (actor.anonymousId) {
      qb.andWhere('i.anonymous_id = :anonymousId', { anonymousId: actor.anonymousId });
    } else {
      return new Set();
    }

    const rows = await qb.getRawMany<{ openRequestId: string }>();
    return new Set(rows.map((r) => r.openRequestId));
  }

  private async actorTagInterests(actor: OpenRequestsFeedActor): Promise<Set<string>> {
    const qb = this.interactions
      .createQueryBuilder('i')
      .innerJoin(OpenRequestEntity, 'r', openRequestInteractionJoinSql('r', 'i'))
      .select('r.tags', 'tags')
      .where('i.kind = :kind', { kind: 'requestDetailView' });

    if (actor.userId) {
      qb.andWhere(interactionUserIdWhereSql('i'), { userId: actor.userId });
    } else if (actor.anonymousId) {
      qb.andWhere('i.anonymous_id = :anonymousId', { anonymousId: actor.anonymousId });
    } else {
      return new Set();
    }

    const rows = await qb.getRawMany<{ tags: string }>();
    const interests = new Set<string>();
    for (const row of rows) {
      const tags = parseTagsColumn(row.tags);
      for (const tag of tags) interests.add(tag.trim().toLowerCase());
    }
    return interests;
  }

  private async ownerRelationshipBoost(actor: OpenRequestsFeedActor): Promise<Map<string, number>> {
    const boost = new Map<string, number>();
    if (!actor.userId) {
      return this.ownerBoostFromViews(actor);
    }

    const proposalRows = await this.proposals
      .createQueryBuilder('p')
      .innerJoin(OpenRequestEntity, 'r', 'r.id = p.request_id')
      .select('DISTINCT r.owner_user_id', 'ownerUserId')
      .where(userIdEqualsParamSql('p.user_id'), { userId: actor.userId })
      .andWhere('r.owner_user_id IS NOT NULL')
      .getRawMany<{ ownerUserId: string }>();

    for (const row of proposalRows) {
      if (row.ownerUserId) boost.set(row.ownerUserId, RELATIONSHIP_PROPOSAL_BOOST);
    }

    const viewBoost = await this.ownerBoostFromViews(actor);
    for (const [ownerId, value] of viewBoost) {
      if (!boost.has(ownerId)) boost.set(ownerId, value);
    }

    return boost;
  }

  private async ownerBoostFromViews(actor: OpenRequestsFeedActor): Promise<Map<string, number>> {
    const boost = new Map<string, number>();
    const qb = this.interactions
      .createQueryBuilder('i')
      .innerJoin(OpenRequestEntity, 'r', openRequestInteractionJoinSql('r', 'i'))
      .select('DISTINCT r.owner_user_id', 'ownerUserId')
      .where('i.kind = :kind', { kind: 'requestDetailView' })
      .andWhere('r.owner_user_id IS NOT NULL');

    if (actor.userId) {
      qb.andWhere(interactionUserIdWhereSql('i'), { userId: actor.userId });
    } else if (actor.anonymousId) {
      qb.andWhere('i.anonymous_id = :anonymousId', { anonymousId: actor.anonymousId });
    } else {
      return boost;
    }

    const rows = await qb.getRawMany<{ ownerUserId: string }>();
    for (const row of rows) {
      if (row.ownerUserId) boost.set(row.ownerUserId, RELATIONSHIP_VIEW_BOOST);
    }
    return boost;
  }

  private toListItem(entity: OpenRequestEntity): OpenRequestListItem {
    return {
      id: entity.id,
      imageUrl: entity.imageUrl,
      imageAlt: entity.imageAlt,
      excerpt: entity.excerpt,
      tags: entity.tags,
      locationLabel: entity.locationLabel,
      publishedAtLabel: entity.publishedAtLabel,
      budgetLabel: entity.budgetLabel,
      publishedAtSort: Number(entity.publishedAtSort),
    };
  }
}

function parseTagsColumn(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') {
    if (raw.includes(',')) return raw.split(',').map((s) => s.trim());
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return raw.length > 0 ? [raw] : [];
    }
  }
  return [];
}
