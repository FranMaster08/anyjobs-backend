import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCampaignMetricsService } from './application/promo-campaign-metrics.service';
import { PromoFeedRankingService } from './application/promo-feed-ranking.service';
import { PromoSlidesInteractionsService } from './application/promo-slides-interactions.service';
import { PromoSlidesController } from './api/controllers/promo-slides.controller';
import { PromoCampaignEntity } from './infrastructure/entities/promo-campaign.entity';
import { PromoSlideInteractionEntity } from './infrastructure/entities/promo-slide-interaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PromoSlideInteractionEntity, PromoCampaignEntity])],
  controllers: [PromoSlidesController],
  providers: [PromoSlidesInteractionsService, PromoCampaignMetricsService, PromoFeedRankingService],
  exports: [PromoSlidesInteractionsService, PromoCampaignMetricsService, PromoFeedRankingService],
})
export class PromoSlidesModule {}
