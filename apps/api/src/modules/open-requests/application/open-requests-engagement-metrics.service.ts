import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenRequestInteractionEntity } from '../infrastructure/entities/open-request-interaction.entity';

export interface OpenRequestEngagementMetricsRow {
  openRequestId: string;
  impressions: number;
  cardClicks: number;
  detailViews: number;
  proposalsStarted: number;
  avgTimeOnDetailMs: number;
}

const DEFAULT_WINDOW_DAYS = 30;

@Injectable()
export class OpenRequestsEngagementMetricsService {
  constructor(
    @InjectRepository(OpenRequestInteractionEntity)
    private readonly interactions: Repository<OpenRequestInteractionEntity>,
  ) {}

  async listMetrics(windowDays = DEFAULT_WINDOW_DAYS): Promise<OpenRequestEngagementMetricsRow[]> {
    const since = new Date();
    since.setDate(since.getDate() - windowDays);

    const rows = await this.interactions
      .createQueryBuilder('i')
      .select('i.open_request_id', 'openRequestId')
      .addSelect(
        `SUM(CASE WHEN i.kind = 'requestListImpression' THEN 1 ELSE 0 END)`,
        'impressions',
      )
      .addSelect(`SUM(CASE WHEN i.kind = 'requestCardClick' THEN 1 ELSE 0 END)`, 'cardClicks')
      .addSelect(`SUM(CASE WHEN i.kind = 'requestDetailView' THEN 1 ELSE 0 END)`, 'detailViews')
      .addSelect(`SUM(CASE WHEN i.kind = 'proposalStarted' THEN 1 ELSE 0 END)`, 'proposalsStarted')
      .where('i.emitted_at >= :since', { since })
      .groupBy('i.open_request_id')
      .getRawMany<{
        openRequestId: string;
        impressions: string;
        cardClicks: string;
        detailViews: string;
        proposalsStarted: string;
      }>();

    const result: OpenRequestEngagementMetricsRow[] = [];

    for (const row of rows) {
      const openRequestId = row.openRequestId;
      const impressions = Number(row.impressions) || 0;
      const cardClicks = Number(row.cardClicks) || 0;
      const detailViews = Number(row.detailViews) || 0;
      const proposalsStarted = Number(row.proposalsStarted) || 0;

      const timeRows = await this.interactions.find({
        where: { openRequestId, kind: 'timeOnDetailMs' },
        select: ['payload'],
        order: { emittedAt: 'DESC' },
        take: 200,
      });

      let timeSum = 0;
      let timeCount = 0;
      for (const t of timeRows) {
        if (!t.payload) continue;
        try {
          const p = JSON.parse(t.payload) as { viewDurationMs?: number };
          if (typeof p.viewDurationMs === 'number' && p.viewDurationMs >= 0) {
            timeSum += p.viewDurationMs;
            timeCount += 1;
          }
        } catch {
          // ignore malformed payload
        }
      }

      result.push({
        openRequestId,
        impressions,
        cardClicks,
        detailViews,
        proposalsStarted,
        avgTimeOnDetailMs: timeCount > 0 ? Math.round(timeSum / timeCount) : 0,
      });
    }

    return result;
  }
}
