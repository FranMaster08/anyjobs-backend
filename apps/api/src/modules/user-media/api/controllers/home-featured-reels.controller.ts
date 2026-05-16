import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../../../shared/security/public.decorator';
import {
  HOME_FEATURED_REELS_DEFAULT_LIMIT,
  HOME_FEATURED_REELS_MAX_LIMIT,
} from '../../application/home-featured-reels.constants';
import {
  UserReelsFeedRankingService,
  type FeedActor,
  type FeedReelSlide,
} from '../../application/user-reels-feed-ranking.service';

type RequestUser = { userId?: string };
type RequestWithUser = Request & { user?: RequestUser };

function parseFeaturedLimit(raw?: string): number {
  if (raw === undefined || raw === '') {
    return HOME_FEATURED_REELS_DEFAULT_LIMIT;
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    return HOME_FEATURED_REELS_DEFAULT_LIMIT;
  }
  return Math.min(n, HOME_FEATURED_REELS_MAX_LIMIT);
}

@ApiTags('Home')
@Controller('home')
export class HomeFeaturedReelsController {
  constructor(private readonly feed: UserReelsFeedRankingService) {}

  @Public()
  @Get('featured-reels')
  @ApiOkResponse({ description: 'Reels destacados para el slider de Home' })
  async list(
    @Query('anonymousId') anonymousId?: string,
    @Query('limit') limit?: string,
    @Req() req?: RequestWithUser,
  ): Promise<FeedReelSlide[]> {
    const actor: FeedActor = {
      userId: req?.user?.userId ?? this.userIdFromHeader(req) ?? null,
      anonymousId: anonymousId ?? null,
    };
    return this.feed.listForHome(actor, parseFeaturedLimit(limit));
  }

  private userIdFromHeader(req?: Request): string | null {
    const raw = req?.headers['x-user-id'];
    if (typeof raw === 'string' && raw.length > 0) return raw;
    return null;
  }
}
