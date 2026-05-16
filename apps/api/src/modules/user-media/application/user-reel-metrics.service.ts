import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReelInteractionEntity } from '../infrastructure/entities/user-reel-interaction.entity';

export interface UserReelMetricsRow {
  reelId: string;
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
export class UserReelMetricsService {
  constructor(
    @InjectRepository(UserReelInteractionEntity)
    private readonly interactions: Repository<UserReelInteractionEntity>,
  ) {}

  async listMetrics(windowDays = DEFAULT_WINDOW_DAYS): Promise<UserReelMetricsRow[]> {
    const since = new Date();
    since.setDate(since.getDate() - windowDays);

    const rows = await this.interactions
      .createQueryBuilder('i')
      .select('i.reel_id', 'reelId')
      .addSelect(`SUM(CASE WHEN i.kind = 'slideImpression' THEN 1 ELSE 0 END)`, 'impressions')
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
        `SUM(CASE WHEN i.kind = 'slideAction' AND i.payload LIKE '%"action":"share"%' THEN 1 ELSE 0 END)`,
        'shares',
      )
      .where('i.reel_id IS NOT NULL')
      .andWhere('i.emitted_at >= :since', { since })
      .groupBy('i.reel_id')
      .getRawMany<{
        reelId: string;
        impressions: string;
        skips: string;
        likes: string;
        saves: string;
        shares: string;
      }>();

    const result: UserReelMetricsRow[] = [];

    for (const row of rows) {
      const reelId = row.reelId;
      const impressions = Number(row.impressions) || 0;
      const skips = Number(row.skips) || 0;
      const likes = Number(row.likes) || 0;
      const saves = Number(row.saves) || 0;
      const shares = Number(row.shares) || 0;

      const watchRows = await this.interactions.find({
        where: { reelId, kind: 'watchProgress' },
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
          // ignore
        }
      }

      const avgWatchMs = watchMsCount > 0 ? Math.round(watchMsSum / watchMsCount) : 0;
      const completionRate = watchMsCount > 0 ? completeViews / watchMsCount : 0;
      const earlySkipRate = impressions > 0 ? skips / impressions : 0;

      result.push({
        reelId,
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
}
