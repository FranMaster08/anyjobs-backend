import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PromoCampaignMetricsService, type PromoCampaignMetricsRow } from './promo-campaign-metrics.service';
import { PromoCampaignEntity } from '../infrastructure/entities/promo-campaign.entity';
import { PromoSlideInteractionEntity } from '../infrastructure/entities/promo-slide-interaction.entity';

export interface PromoSlideResponse {
  id: string;
  type: 'image' | 'video';
  media: string;
  user?: string;
  avatar?: string;
  caption?: string;
  music?: string;
  counts?: Record<string, string>;
  poster?: string;
  [key: string]: unknown;
}

export interface PromoFeedActor {
  userId?: string | null;
  anonymousId?: string | null;
}

/** Pesos inspirados en retención > interacción > penalización por skip temprano. */
const WEIGHTS = {
  completion: 0.5,
  saves: 0.15,
  shares: 0.15,
  likes: 0.1,
  earlySkip: 0.2,
} as const;

const COLD_START_IMPRESSIONS = 10;
const TESTING_DEFAULT_DAILY_CAP = 200;

@Injectable()
export class PromoFeedRankingService {
  constructor(
    @InjectRepository(PromoCampaignEntity)
    private readonly campaigns: Repository<PromoCampaignEntity>,
    @InjectRepository(PromoSlideInteractionEntity)
    private readonly interactions: Repository<PromoSlideInteractionEntity>,
    private readonly metricsService: PromoCampaignMetricsService,
  ) {}

  async listRankedSlides(actor: PromoFeedActor = {}): Promise<PromoSlideResponse[]> {
    const active = await this.campaigns.find({
      where: { status: In(['testing', 'scaling']) },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });

    if (active.length === 0) {
      return [];
    }

    const metricsList = await this.metricsService.listMetrics();
    const metricsById = new Map(metricsList.map((m) => [m.campaignId, m]));
    const seenCampaigns = await this.seenCampaignIds(actor);
    const todayImpressions = await this.todayImpressionsByCampaign();

    const scored = await Promise.all(
      active.map(async (campaign) => {
        const eligible = await this.isEligibleForActor(campaign, todayImpressions);
        if (!eligible) return null;

        const metrics = metricsById.get(campaign.id);
        const score = this.computeScore(metrics, campaign);
        const deprioritize = seenCampaigns.has(campaign.id);

        return {
          campaign,
          score,
          deprioritize,
        };
      }),
    );

    const eligibleScored = scored.filter((s): s is NonNullable<typeof s> => s !== null);

    eligibleScored.sort((a, b) => {
      if (a.deprioritize !== b.deprioritize) return a.deprioritize ? 1 : -1;
      if (b.score !== a.score) return b.score - a.score;
      if (b.campaign.priority !== a.campaign.priority) return b.campaign.priority - a.campaign.priority;
      return b.campaign.createdAt.getTime() - a.campaign.createdAt.getTime();
    });

    return eligibleScored.map(({ campaign }) => this.toSlideResponse(campaign));
  }

  private computeScore(metrics: PromoCampaignMetricsRow | undefined, campaign: PromoCampaignEntity): number {
    if (!metrics || metrics.impressions < COLD_START_IMPRESSIONS) {
      return campaign.priority * 1000 + campaign.createdAt.getTime() / 1_000_000;
    }

    const imp = Math.max(metrics.impressions, 1);
    const normSaves = metrics.saves / imp;
    const normShares = metrics.shares / imp;
    const normLikes = metrics.likes / imp;

    return (
      metrics.completionRate * WEIGHTS.completion +
      normSaves * WEIGHTS.saves +
      normShares * WEIGHTS.shares +
      normLikes * WEIGHTS.likes -
      metrics.earlySkipRate * WEIGHTS.earlySkip
    );
  }

  private async isEligibleForActor(
    campaign: PromoCampaignEntity,
    todayImpressions: Map<string, number>,
  ): Promise<boolean> {
    if (campaign.status !== 'testing') return true;

    const cap = campaign.testingDailyImpressionCap ?? TESTING_DEFAULT_DAILY_CAP;
    const today = todayImpressions.get(campaign.id) ?? 0;
    return today < cap;
  }

  private async todayImpressionsByCampaign(): Promise<Map<string, number>> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const rows = await this.interactions
      .createQueryBuilder('i')
      .select('i.campaign_id', 'campaignId')
      .addSelect('COUNT(*)', 'cnt')
      .where('i.kind = :kind', { kind: 'slideImpression' })
      .andWhere('i.emitted_at >= :start', { start })
      .andWhere('i.campaign_id IS NOT NULL')
      .groupBy('i.campaign_id')
      .getRawMany<{ campaignId: string; cnt: string }>();

    return new Map(rows.map((r) => [r.campaignId, Number(r.cnt) || 0]));
  }

  private async seenCampaignIds(actor: PromoFeedActor): Promise<Set<string>> {
    const qb = this.interactions
      .createQueryBuilder('i')
      .select('DISTINCT i.campaign_id', 'campaignId')
      .where('i.campaign_id IS NOT NULL')
      .andWhere('i.kind IN (:...kinds)', {
        kinds: ['slideImpression', 'slideViewStart', 'slideAction', 'slideFollow', 'doubleTap'],
      });

    if (actor.userId) {
      qb.andWhere('i.user_id = :userId', { userId: actor.userId });
    } else if (actor.anonymousId) {
      qb.andWhere('i.anonymous_id = :anonymousId', { anonymousId: actor.anonymousId });
    } else {
      return new Set();
    }

    const rows = await qb.getRawMany<{ campaignId: string }>();
    return new Set(rows.map((r) => r.campaignId));
  }

  private toSlideResponse(campaign: PromoCampaignEntity): PromoSlideResponse {
    const slide = JSON.parse(campaign.slideData) as PromoSlideResponse;
    return { ...slide, id: campaign.id };
  }
}
