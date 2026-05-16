import { Body, Controller, Get, HttpCode, Post, Query, Req } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../../../shared/security/public.decorator';
import { UserReelInteractionsService } from '../../application/user-reel-interactions.service';
import { UserReelsFeedRankingService, type FeedReelSlide } from '../../application/user-reels-feed-ranking.service';
import { TrackUserReelInteractionDto } from '../dto/track-user-reel-interaction.dto';

type RequestUser = { userId?: string };
type RequestWithUser = Request & { user?: RequestUser };

@ApiTags('Feed')
@Controller('feed/reels')
export class FeedReelsController {
  constructor(
    private readonly feed: UserReelsFeedRankingService,
    private readonly interactions: UserReelInteractionsService,
  ) {}

  @Public()
  @Get()
  @ApiOkResponse({ description: 'Feed de reels ordenado por ranking' })
  async list(
    @Query('anonymousId') anonymousId?: string,
    @Req() req?: RequestWithUser,
  ): Promise<FeedReelSlide[]> {
    return this.feed.listRankedFeed({
      userId: req?.user?.userId ?? this.userIdFromHeader(req) ?? null,
      anonymousId: anonymousId ?? null,
    });
  }

  private userIdFromHeader(req?: Request): string | null {
    const raw = req?.headers['x-user-id'];
    if (typeof raw === 'string' && raw.length > 0) return raw;
    return null;
  }

  @Public()
  @Post('interactions')
  @HttpCode(204)
  async trackInteraction(@Body() body: TrackUserReelInteractionDto): Promise<void> {
    await this.interactions.track(body);
  }
}
