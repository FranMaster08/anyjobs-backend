import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoSlideInteractionEntity } from '../infrastructure/entities/promo-slide-interaction.entity';

export interface PromoCampaignMetricsRow {
  campaignId: string;
  impressions: number;
  completeViews: number;
  avgWatchMs: number;
  earlySkipRate: number;
  likes: number;
  saves: number;
  shares: number;
  completionRate: number;
}

const DEFAULT_WINDOW_DAYS = 30;
const COMPLETION_THRESHOLD = 0.9;

@Injectable()
export class PromoCampaignMetricsService {
  constructor(
    @InjectRepository(PromoSlideInteractionEntity)
    private readonly interactions: Repository<PromoSlideInteractionEntity>,
  ) {}

  async listMetrics(windowDays = DEFAULT_WINDOW_DAYS): Promise<PromoCampaignMetricsRow[]> {
    const since = new Date();
    since.setDate(since.getDate() - windowDays);

    const rows = await this.interactions
      .createQueryBuilder('i')
      .select('i.campaign_id', 'campaignId')
      .addSelect(`SUM(CASE WHEN i.kind = 'slideImpression' THEN 1 ELSE 0 END)`, 'impressions')
      .addSelect(
        `SUM(CASE WHEN i.kind = 'watchProgress' AND i.payload LIKE '%"completionRate":%' THEN 1 ELSE 0 END)`,
        'watchEvents',
      )
      .addSelect(`SUM(CASE WHEN i.kind = 'slideSkipped' THEN 1 ELSE 0 END)`, 'skips')
      .addSelect(
        `SUM(CASE WHEN i.kind = 'slideAction' AND i.payload LIKE '%"action":"like"%' THEN 1 ELSE 0 END)`,
        'likes',
      )
      .addSelect(
        `SUM(CASE WHEN i.kind = 'slideAction' AND i.payload LIKE '%"action":"bookmark"%' THEN 1 ELSE 0 END)`,
        'saves',
      )
      .addSelect(
        `SUM(CASE WHEN i.kind = 'slideAction' AND (i.payload LIKE '%"action":"share"%' OR i.kind = 'slideAction' AND i.payload LIKE '%"action":"share"') THEN 1 ELSE 0 END)`,
        'shares',
      )
      .where('i.campaign_id IS NOT NULL')
      .andWhere('i.emitted_at >= :since', { since })
      .groupBy('i.campaign_id')
      .getRawMany<{
        campaignId: string;
        impressions: string;
        watchEvents: string;
        skips: string;
        likes: string;
        saves: string;
        shares: string;
      }>();

    const result: PromoCampaignMetricsRow[] = [];

    for (const row of rows) {
      const campaignId = row.campaignId;
      const impressions = Number(row.impressions) || 0;
      const skips = Number(row.skips) || 0;
      const likes = Number(row.likes) || 0;
      const saves = Number(row.saves) || 0;
      const shares = Number(row.shares) || 0;

      const watchRows = await this.interactions.find({
        where: { campaignId, kind: 'watchProgress' },
        select: ['payload'],
        order: { emittedAt: 'DESC' },
        take: 500,
      });

      let watchMsSum = 0;
      let watchMsCount = 0;
      let completeViews = 0;

      for (const w of watchRows) {
        if (!w.payload) continue;
        try {
          const p = JSON.parse(w.payload) as { watchMs?: number; completionRate?: number };
          if (typeof p.watchMs === 'number') {
            watchMsSum += p.watchMs;
            watchMsCount += 1;
          }
          if (typeof p.completionRate === 'number' && p.completionRate >= COMPLETION_THRESHOLD) {
            completeViews += 1;
          }
        } catch {
          // ignore malformed payload
        }
      }

      const avgWatchMs = watchMsCount > 0 ? Math.round(watchMsSum / watchMsCount) : 0;
      const earlySkipRate = impressions > 0 ? skips / impressions : 0;
      const completionRate = impressions > 0 ? completeViews / impressions : 0;

      result.push({
        campaignId,
        impressions,
        completeViews,
        avgWatchMs,
        earlySkipRate,
        likes,
        saves,
        shares,
        completionRate,
      });
    }

    return result;
  }

  async getMetricsForCampaign(
    campaignId: string,
    windowDays = DEFAULT_WINDOW_DAYS,
  ): Promise<PromoCampaignMetricsRow | null> {
    const all = await this.listMetrics(windowDays);
    return all.find((m) => m.campaignId === campaignId) ?? null;
  }
}
