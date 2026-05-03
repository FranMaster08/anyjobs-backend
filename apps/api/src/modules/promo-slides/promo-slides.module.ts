import { Module } from '@nestjs/common';
import { PromoSlidesController } from './api/controllers/promo-slides.controller';

@Module({
  controllers: [PromoSlidesController],
})
export class PromoSlidesModule {}
