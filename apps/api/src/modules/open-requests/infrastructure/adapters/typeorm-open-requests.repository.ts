import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buildPageMeta } from '../../../../shared/application/pagination/page-result';
import type { PageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import type { OpenRequestDetail, OpenRequestListItem } from '../../domain/open-request';
import type {
  CreateOpenRequestRecordInput,
  OpenRequestsRepositoryPort,
  UpdateOpenRequestRecordPatch,
} from '../../application/ports/open-requests-repository.port';
import { OpenRequestEntity } from '../entities/open-request.entity';

function parseJsonIfString<T>(value: unknown, fallback: T): T {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return (value as T) ?? fallback;
}

function toListItem(e: OpenRequestEntity): OpenRequestListItem {
  return {
    id: e.id,
    imageUrl: e.imageUrl,
    imageAlt: e.imageAlt,
    excerpt: e.excerpt,
    tags: e.tags,
    locationLabel: e.locationLabel,
    publishedAtLabel: e.publishedAtLabel,
    budgetLabel: e.budgetLabel,
    publishedAtSort: Number(e.publishedAtSort),
  };
}

function toDetail(e: OpenRequestEntity): OpenRequestDetail {
  const parsedImages = parseJsonIfString<unknown>(e.images as any, []);
  const imagesArray = Array.isArray(parsedImages) ? (parsedImages as Array<{ url?: unknown; alt?: unknown }>) : [];
  const fallbackAlt = (e.imageAlt ?? '').trim() || 'Imagen de la solicitud';

  const normalizedImages = imagesArray
    .map((img) => {
      const url = typeof img?.url === 'string' ? img.url.trim() : '';
      if (!url) return null;
      const alt = typeof img?.alt === 'string' ? img.alt.trim() : '';
      return { url, alt: alt || fallbackAlt };
    })
    .filter((x): x is { url: string; alt: string } => x !== null);

  const images = normalizedImages.length > 0 ? normalizedImages : e.imageUrl ? [{ url: e.imageUrl, alt: fallbackAlt }] : [];

  return {
    id: e.id,
    title: e.title,
    excerpt: e.excerpt,
    description: e.description,
    tags: e.tags,
    locationLabel: e.locationLabel,
    publishedAtLabel: e.publishedAtLabel,
    budgetLabel: e.budgetLabel,
    provider: parseJsonIfString(e.provider as any, { name: '', badge: '', subtitle: '' }),
    reputation: e.reputation,
    reviewsCount: e.reviewsCount,
    providerReviews: parseJsonIfString(e.providerReviews as any, []),
    contactPhone: e.contactPhone,
    contactEmail: e.contactEmail,
    images,
  };
}

@Injectable()
export class TypeOrmOpenRequestsRepository implements OpenRequestsRepositoryPort {
  constructor(@InjectRepository(OpenRequestEntity) private readonly repo: Repository<OpenRequestEntity>) {}

  async list(pageRequest: PageRequest): Promise<PageResult<OpenRequestListItem>> {
    const totalItems = await this.repo.count();
    const meta = buildPageMeta(totalItems, pageRequest.page, pageRequest.pageSize);

    const items = await this.repo.find({
      order: { publishedAtSort: 'DESC' as any, id: 'ASC' as any },
      skip: (meta.page - 1) * meta.pageSize,
      take: meta.pageSize,
    });

    return { items: items.map(toListItem), meta };
  }

  async getById(id: string): Promise<OpenRequestDetail | null> {
    const e = await this.repo.findOne({ where: { id } });
    return e ? toDetail(e) : null;
  }

  async create(input: CreateOpenRequestRecordInput): Promise<OpenRequestDetail> {
    const entity = this.repo.create({
      id: input.id,
      ownerUserId: input.ownerUserId,
      title: input.title,
      excerpt: input.excerpt,
      description: input.description,
      tags: input.tags,
      locationLabel: input.locationLabel,
      publishedAtLabel: input.publishedAtLabel,
      publishedAtSort: String(input.publishedAtSort),
      budgetLabel: input.budgetLabel,
      imageUrl: input.imageUrl,
      imageAlt: input.imageAlt,
      provider: input.provider,
      reputation: input.reputation,
      reviewsCount: input.reviewsCount,
      providerReviews: input.providerReviews,
      contactPhone: input.contactPhone,
      contactEmail: input.contactEmail,
      images: input.images,
    });
    const saved = await this.repo.save(entity);
    return toDetail(saved);
  }

  async updatePartial(id: string, patch: UpdateOpenRequestRecordPatch): Promise<OpenRequestDetail | null> {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) return null;
    if (patch.title !== undefined) e.title = patch.title;
    if (patch.excerpt !== undefined) e.excerpt = patch.excerpt;
    if (patch.description !== undefined) e.description = patch.description;
    if (patch.tags !== undefined) e.tags = patch.tags;
    if (patch.locationLabel !== undefined) e.locationLabel = patch.locationLabel;
    if (patch.publishedAtLabel !== undefined) e.publishedAtLabel = patch.publishedAtLabel;
    if (patch.publishedAtSort !== undefined) e.publishedAtSort = String(patch.publishedAtSort);
    if (patch.budgetLabel !== undefined) e.budgetLabel = patch.budgetLabel;
    if (patch.imageUrl !== undefined) e.imageUrl = patch.imageUrl;
    if (patch.imageAlt !== undefined) e.imageAlt = patch.imageAlt;
    if (patch.provider !== undefined) e.provider = patch.provider;
    if (patch.reputation !== undefined) e.reputation = patch.reputation;
    if (patch.reviewsCount !== undefined) e.reviewsCount = patch.reviewsCount;
    if (patch.providerReviews !== undefined) e.providerReviews = patch.providerReviews;
    if (patch.contactPhone !== undefined) e.contactPhone = patch.contactPhone;
    if (patch.contactEmail !== undefined) e.contactEmail = patch.contactEmail;
    if (patch.images !== undefined) e.images = patch.images;
    await this.repo.save(e);
    const refreshed = await this.repo.findOne({ where: { id } });
    return refreshed ? toDetail(refreshed) : null;
  }

  async softDelete(id: string): Promise<boolean> {
    const res = await this.repo.softDelete({ id });
    return (res.affected ?? 0) > 0;
  }

  async findOwnerId(id: string): Promise<{ ownerUserId: string | null } | null> {
    const row = await this.repo.findOne({ where: { id }, select: ['id', 'ownerUserId'] });
    return row ? { ownerUserId: row.ownerUserId } : null;
  }
}

