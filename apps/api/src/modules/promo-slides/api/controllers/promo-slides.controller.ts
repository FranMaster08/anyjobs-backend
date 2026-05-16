import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../../../shared/security/public.decorator';
import { RequirePermissions } from '../../../../shared/security/require-permissions.decorator';
import { PromoCampaignMetricsService } from '../../application/promo-campaign-metrics.service';
import { PromoFeedRankingService } from '../../application/promo-feed-ranking.service';
import { PromoSlidesInteractionsService } from '../../application/promo-slides-interactions.service';
import { TrackPromoInteractionDto } from '../dto/track-promo-interaction.dto';

interface RequestWithUser extends Request {
  user?: { userId?: string };
}

@ApiTags('Promo Slides')
@Controller('promo-slides')
export class PromoSlidesController {
  constructor(
    private readonly interactions: PromoSlidesInteractionsService,
    private readonly metrics: PromoCampaignMetricsService,
    private readonly feed: PromoFeedRankingService,
  ) {}

  @Public()
  @Get()
  async list(
    @Query('anonymousId') anonymousId?: string,
    @Req() req?: RequestWithUser,
  ): Promise<unknown[]> {
    const userId = req?.user?.userId ?? this.userIdFromHeader(req);
    return this.feed.listRankedSlides({
      userId: userId ?? null,
      anonymousId: anonymousId ?? null,
    });
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('interactions')
  async trackInteraction(@Body() body: TrackPromoInteractionDto): Promise<void> {
    await this.interactions.track(body);
  }

  @RequirePermissions('promo-slides.metrics.read')
  @Get('metrics')
  async listMetrics(@Query('windowDays') windowDays?: string) {
    const days = windowDays ? Number.parseInt(windowDays, 10) : undefined;
    return this.metrics.listMetrics(Number.isFinite(days) ? days : undefined);
  }

  @RequirePermissions('promo-slides.metrics.read')
  @Get('metrics/:campaignId')
  async campaignMetrics(
    @Param('campaignId') campaignId: string,
    @Query('windowDays') windowDays?: string,
  ) {
    const days = windowDays ? Number.parseInt(windowDays, 10) : undefined;
    return this.metrics.getMetricsForCampaign(
      campaignId,
      Number.isFinite(days) ? days : undefined,
    );
  }

  private userIdFromHeader(req?: Request): string | null {
    const raw = req?.headers['x-user-id'];
    if (typeof raw === 'string' && raw.length > 0) return raw;
    return null;
  }
}
