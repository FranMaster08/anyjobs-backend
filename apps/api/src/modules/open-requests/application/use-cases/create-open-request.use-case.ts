import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { OPEN_REQUESTS_REPOSITORY } from '../ports';
import type { OpenRequestsRepositoryPort } from '../ports';
import type { OpenRequestDetail } from '../../domain';

export type CreateOpenRequestInput = {
  ownerUserId: string;
  title: string;
  excerpt: string;
  description: string;
  tags: string[];
  locationLabel: string;
  budgetLabel: string;
  contactPhone: string;
  contactEmail: string;
  publishedAtLabel?: string;
  imageUrl?: string;
  imageAlt?: string;
  images?: { url: string; alt: string }[];
  provider?: { name: string; badge: string; subtitle: string };
  reputation?: number;
  reviewsCount?: number;
  providerReviews?: { author: string; rating: number; dateLabel: string; text: string }[];
};

@Injectable()
export class CreateOpenRequestUseCase {
  constructor(
    @Inject(OPEN_REQUESTS_REPOSITORY) private readonly repo: OpenRequestsRepositoryPort,
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
    const images = input.images ?? [];

    return this.repo.create({
      id,
      ownerUserId: input.ownerUserId,
      title: input.title,
      excerpt: input.excerpt,
      description: input.description,
      tags: input.tags,
      locationLabel: input.locationLabel,
      publishedAtLabel,
      publishedAtSort,
      budgetLabel: input.budgetLabel,
      imageUrl,
      imageAlt,
      provider,
      reputation,
      reviewsCount,
      providerReviews,
      contactPhone: input.contactPhone,
      contactEmail: input.contactEmail,
      images,
    });
  }
}
