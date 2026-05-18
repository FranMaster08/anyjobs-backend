import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import type { AppConfiguration } from '../../../../config/configuration';
import { AppException } from '../../../../shared/errors/app-exception';
import { resolvePublicAssetUrl } from '../../../../shared/url/resolve-public-asset-url';
import { IMAGE_STORAGE_PROVIDER, OPEN_REQUESTS_REPOSITORY } from '../ports';
import type { OpenRequestsRepositoryPort } from '../ports';
import type { OpenRequestDetail } from '../../domain';
import type { ImageStorageProvider } from '../ports';

export type CreateOpenRequestInput = {
  ownerUserId: string;
  title: string;
  excerpt: string;
  description: string;
  tags: string[];
  locationLabel: string;
  locationLat?: number;
  locationLng?: number;
  budgetLabel: string;
  contactPhone: string;
  contactEmail: string;
  publishedAtLabel?: string;
  imageUrl?: string;
  imageAlt?: string;
  images?: { url: string; alt: string }[];
  uploadedImages?: Array<{ bytes: Buffer; mimeType: string; originalName?: string; alt?: string }>;
  provider?: { name: string; badge: string; subtitle: string };
  reputation?: number;
  reviewsCount?: number;
  providerReviews?: { author: string; rating: number; dateLabel: string; text: string }[];
};

@Injectable()
export class CreateOpenRequestUseCase {
  constructor(
    @Inject(OPEN_REQUESTS_REPOSITORY) private readonly repo: OpenRequestsRepositoryPort,
    @Inject(IMAGE_STORAGE_PROVIDER) private readonly storage: ImageStorageProvider,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: CreateOpenRequestInput): Promise<OpenRequestDetail> {
    const id = randomUUID();
    const publishedAtSort = Date.now();
    const publishedAtLabel = input.publishedAtLabel ?? 'Recién publicado';
    const provider = input.provider ?? { name: 'Cliente', badge: 'NUEVO', subtitle: 'Solicitud publicada' };
    const reputation = input.reputation ?? 0;
    const reviewsCount = input.reviewsCount ?? 0;
    const providerReviews = input.providerReviews ?? [];
    const imageUrl = input.imageUrl?.trim() || 'https://picsum.photos/seed/open-req/640/360';
    const imageAlt = input.imageAlt?.trim() || 'Imagen de la solicitud';
    const uploadedImages = await Promise.all(
      (input.uploadedImages ?? []).map(async (file) => {
        const saved = await this.storage.save({
          bytes: file.bytes,
          mimeType: file.mimeType,
          originalName: file.originalName,
        });
        const fallbackAlt = file.originalName?.trim() || imageAlt;
        return {
          url: saved.url,
          alt: (file.alt ?? '').trim() || fallbackAlt,
          storageKey: saved.storageKey,
        };
      }),
    );
    const images = [
      ...(input.images ?? []).map((img) => ({ url: img.url, alt: img.alt, storageKey: null as string | null })),
      ...uploadedImages,
    ];

    if (images.length < 1 || images.length > 6) {
      await Promise.all(uploadedImages.map((img) => this.storage.delete(img.storageKey)));
      throw new AppException('VALIDATION.INVALID_INPUT', 'Invalid open request image count', {
        images: 'Open request must contain between 1 and 6 images.',
      });
    }

    const publicBaseUrl = this.configService.getOrThrow<AppConfiguration['app']>('app').publicUrl;
    const persistImages = images.map((img) => ({
      ...img,
      url: resolvePublicAssetUrl(publicBaseUrl, img.url),
    }));
    const primaryUrl = resolvePublicAssetUrl(publicBaseUrl, images[0]?.url ?? imageUrl);
    const primaryAlt = images[0]?.alt ?? imageAlt;

    try {
      const created = await this.repo.create({
        id,
        ownerUserId: input.ownerUserId,
        title: input.title,
        excerpt: input.excerpt,
        description: input.description,
        tags: input.tags,
        locationLabel: input.locationLabel,
        locationLat: input.locationLat,
        locationLng: input.locationLng,
        publishedAtLabel,
        publishedAtSort,
        budgetLabel: input.budgetLabel,
        imageUrl: primaryUrl,
        imageAlt: primaryAlt,
        provider,
        reputation,
        reviewsCount,
        providerReviews,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
        images: persistImages.map((img) => ({ url: img.url, alt: img.alt })),
      });
      await this.repo.replaceImages(id, input.ownerUserId, persistImages);
      return (await this.repo.getById(created.id)) ?? created;
    } catch (error) {
      await Promise.all(uploadedImages.map((img) => this.storage.delete(img.storageKey)));
      throw error;
    }
  }
}
