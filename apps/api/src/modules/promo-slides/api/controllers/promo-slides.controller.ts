import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../shared/security/public.decorator';

/** Contrato alineado con `SlideData` de ngx-vertical-slider + `id` de campaña (sin persistencia en MVP). */
const PROMO_SLIDES = [
  {
    id: 'camp-promo-1',
    type: 'image' as const,
    media: 'https://picsum.photos/720/1280',
    user: '@Anyjobs',
    avatar: 'https://i.pravatar.cc/100?img=12',
    caption: 'Descubre oportunidades cerca de ti.',
    music: 'sonido original',
    counts: { like: '1.2K', comment: '48', bookmark: '12' },
  },
  {
    id: 'camp-promo-2',
    type: 'video' as const,
    media: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://picsum.photos/seed/promo2/720/1280',
    user: '@Anyjobs',
    avatar: 'https://i.pravatar.cc/100?img=45',
    caption: 'Publicidad — vídeo de ejemplo (mute por defecto).',
    music: 'pista promocional',
    counts: { like: '890' },
  },
];

@ApiTags('Promo Slides')
@Controller('promo-slides')
export class PromoSlidesController {
  private readonly logger = new Logger(PromoSlidesController.name);

  @Public()
  @Get()
  list(): typeof PROMO_SLIDES {
    return PROMO_SLIDES;
  }

  /**
   * Telemetría / acciones: cuerpo incluye `subjectType`, `userId` o `anonymousId`, `sliderId`, `slide`…
   * Con sesión, el front envía `Authorization: Bearer` (mismo patrón que otras APIs vía proxy).
   */
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('interactions')
  trackInteraction(@Body() body: Record<string, unknown>): void {
    this.logger.log(`interaction ${JSON.stringify(body)}`);
  }
}
