import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import type { AppConfiguration } from '../../../config/configuration';
import { resolvePublicAssetUrl } from '../../../shared/url/resolve-public-asset-url';
import { LocalUserMediaStorageProvider } from '../infrastructure/adapters/local-user-media-storage.provider';
import { MediaAssetEntity } from '../infrastructure/entities/media-asset.entity';
import { UserReelEntity } from '../infrastructure/entities/user-reel.entity';
import { UserReelInteractionEntity } from '../infrastructure/entities/user-reel-interaction.entity';
import { UserReelMetricsService, type UserReelMetricsRow } from './user-reel-metrics.service';

export interface FeedReelSlide {
  id: string;
  type: 'image' | 'video';
  media: string;
  caption?: string;
  creatorUserId: string;
  creatorName?: string;
  [key: string]: unknown;
}

export interface FeedActor {
  userId?: string | null;
  anonymousId?: string | null;
}

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
export class UserReelsFeedRankingService {
  constructor(
    @InjectRepository(UserReelEntity)
    private readonly reels: Repository<UserReelEntity>,
    @InjectRepository(MediaAssetEntity)
    private readonly assets: Repository<MediaAssetEntity>,
    @InjectRepository(UserReelInteractionEntity)
    private readonly interactions: Repository<UserReelInteractionEntity>,
    private readonly metricsService: UserReelMetricsService,
    private readonly storage: LocalUserMediaStorageProvider,
    private readonly configService: ConfigService<AppConfiguration>,
  ) {}

  async listRankedFeed(actor: FeedActor = {}): Promise<FeedReelSlide[]> {
    const candidates = await this.reels.find({
      where: {
        moderationStatus: 'approved',
        distributionStatus: In(['testing', 'scaling']),
      },
      relations: ['mediaAsset'],
      order: { publishedAt: 'DESC' },
    });

    if (candidates.length === 0) return [];

    const metricsList = await this.metricsService.listMetrics();
    const metricsById = new Map(metricsList.map((m) => [m.reelId, m]));
    const seenReels = await this.seenReelIds(actor);
    const todayImpressions = await this.todayImpressionsByReel();

    const ownerNames = await this.loadOwnerNames(candidates.map((r) => r.ownerUserId));
    const publicBaseUrl = this.configService.getOrThrow<AppConfiguration['app']>('app').publicUrl;

    const scored = await Promise.all(
      candidates.map(async (reel) => {
        const eligible = await this.isEligible(reel, todayImpressions);
        if (!eligible) return null;

        const asset = reel.mediaAsset ?? (await this.assets.findOne({ where: { id: reel.mediaAssetId } }));
        if (!asset || asset.status !== 'ready') return null;

        const metrics = metricsById.get(reel.id);
        const score = this.computeScore(metrics, reel);
        const deprioritize = seenReels.has(reel.id);

        return {
          reel,
          asset,
          score,
          deprioritize,
          creatorName: ownerNames.get(reel.ownerUserId),
          publicBaseUrl,
        };
      }),
    );

    const eligible = scored.filter((s): s is NonNullable<typeof s> => s !== null);

    eligible.sort((a, b) => {
      if (a.deprioritize !== b.deprioritize) return a.deprioritize ? 1 : -1;
      if (b.score !== a.score) return b.score - a.score;
      const aPub = a.reel.publishedAt?.getTime() ?? 0;
      const bPub = b.reel.publishedAt?.getTime() ?? 0;
      return bPub - aPub;
    });

    return eligible.map(({ reel, asset, creatorName, publicBaseUrl }) =>
      this.toSlide(reel, asset, creatorName, publicBaseUrl),
    );
  }

  private computeScore(metrics: UserReelMetricsRow | undefined, reel: UserReelEntity): number {
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

  private async isEligible(
    reel: UserReelEntity,
    todayImpressions: Map<string, number>,
  ): Promise<boolean> {
    if (reel.distributionStatus !== 'testing') return true;
    const cap = reel.testingDailyImpressionCap ?? TESTING_DEFAULT_DAILY_CAP;
    return (todayImpressions.get(reel.id) ?? 0) < cap;
  }

  private async todayImpressionsByReel(): Promise<Map<string, number>> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const rows = await this.interactions
      .createQueryBuilder('i')
      .select('i.reel_id', 'reelId')
      .addSelect('COUNT(*)', 'cnt')
      .where('i.kind = :kind', { kind: 'slideImpression' })
      .andWhere('i.emitted_at >= :start', { start })
      .andWhere('i.reel_id IS NOT NULL')
      .groupBy('i.reel_id')
      .getRawMany<{ reelId: string; cnt: string }>();

    return new Map(rows.map((r) => [r.reelId, Number(r.cnt) || 0]));
  }

  private async seenReelIds(actor: FeedActor): Promise<Set<string>> {
    const qb = this.interactions
      .createQueryBuilder('i')
      .select('DISTINCT i.reel_id', 'reelId')
      .where('i.reel_id IS NOT NULL')
      .andWhere('i.kind IN (:...kinds)', {
        kinds: ['slideImpression', 'slideViewStart', 'slideAction', 'doubleTap'],
      });

    if (actor.userId) {
      qb.andWhere('i.user_id = :userId', { userId: actor.userId });
    } else if (actor.anonymousId) {
      qb.andWhere('i.anonymous_id = :anonymousId', { anonymousId: actor.anonymousId });
    } else {
      return new Set();
    }

    const rows = await qb.getRawMany<{ reelId: string }>();
    return new Set(rows.map((r) => r.reelId));
  }

  private async loadOwnerNames(userIds: string[]): Promise<Map<string, string>> {
    const unique = [...new Set(userIds)];
    if (unique.length === 0) return new Map();

    const rows = await this.reels.manager.query(
      `SELECT id, full_name AS fullName FROM users WHERE id IN (${unique.map(() => '?').join(',')})`,
      unique,
    );

    return new Map(
      (rows as { id: string; fullName: string }[]).map((r) => [r.id, r.fullName]),
    );
  }

  private toSlide(
    reel: UserReelEntity,
    asset: MediaAssetEntity,
    creatorName: string | undefined,
    publicBaseUrl: string,
  ): FeedReelSlide {
    const mediaUrl = resolvePublicAssetUrl(publicBaseUrl, this.storage.resolveUrl(asset.storageKey));
    return {
      id: reel.id,
      type: asset.mediaKind === 'video' ? 'video' : 'image',
      media: mediaUrl,
      caption: reel.caption ?? undefined,
      creatorUserId: reel.ownerUserId,
      user: creatorName,
    };
  }
}
