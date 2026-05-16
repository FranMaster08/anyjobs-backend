import { Injectable } from '@nestjs/common';
import { UserReelEntity } from '../infrastructure/entities/user-reel.entity';
import type { UserReelMetricsRow } from './user-reel-metrics.service';

const WEIGHTS = {
  completion: 0.5,
  saves: 0.15,
  shares: 0.15,
  likes: 0.1,
  earlySkip: 0.2,
} as const;

const COLD_START_IMPRESSIONS = 10;

/**
 * On-read scoring only. Persisting `ranking_score` and the final formula
 * (retention, user relevance, etc.) will be defined in a later change.
 */
@Injectable()
export class UserReelRankingScoreService {
  resolveEffectiveScore(metrics: UserReelMetricsRow | undefined, reel: UserReelEntity): number {
    return this.computeScore(metrics, reel);
  }

  computeScore(metrics: UserReelMetricsRow | undefined, reel: UserReelEntity): number {
    if (!metrics || metrics.impressions < COLD_START_IMPRESSIONS) {
      return (reel.publishedAt?.getTime() ?? reel.createdAt.getTime()) / 1_000_000;
    }

    const imp = Math.max(metrics.impressions, 1);
    return (
      metrics.completionRate * WEIGHTS.completion +
      (metrics.saves / imp) * WEIGHTS.saves +
      (metrics.shares / imp) * WEIGHTS.shares +
      (metrics.likes / imp) * WEIGHTS.likes -
      metrics.earlySkipRate * WEIGHTS.earlySkip
    );
  }
}
