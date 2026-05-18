import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { buildPageMeta } from '../../../../shared/application/pagination/page-result';
import type { PageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import type { NearbyOpenRequestItem, OpenRequestDetail, OpenRequestListItem } from '../../domain/open-request';
import type {
  CreateOpenRequestRecordInput,
  ListNearbyOpenRequestsInput,
  OpenRequestsRepositoryPort,
  UpdateOpenRequestRecordPatch,
} from '../../application/ports/open-requests-repository.port';
import { haversineDistanceKmSql } from '../../application/open-requests-haversine';
import { formatRelativePublishedAt } from '../../application/format-relative-published-at';
import { OpenRequestEntity } from '../entities/open-request.entity';
import { OpenRequestImageEntity } from '../entities/open-request-image.entity';

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
  const publishedAtSort = Number(e.publishedAtSort);
  const item: OpenRequestListItem = {
    id: e.id,
    imageUrl: e.imageUrl,
    imageAlt: e.imageAlt,
    excerpt: e.excerpt,
    tags: e.tags,
    locationLabel: e.locationLabel,
    publishedAtLabel: formatRelativePublishedAt(publishedAtSort),
    budgetLabel: e.budgetLabel,
    publishedAtSort,
  };
  if (e.locationLat != null && e.locationLng != null) {
    item.locationLat = e.locationLat;
    item.locationLng = e.locationLng;
  }
  return item;
}

function toDetail(e: OpenRequestEntity): OpenRequestDetail {
  const fallbackAlt = (e.imageAlt ?? '').trim() || 'Imagen de la solicitud';
  const relatedImages =
    (e.imageRecords ?? [])
      .map((img) => {
        const url = (img.url ?? '').trim();
        if (!url) return null;
        const alt = (img.alt ?? '').trim();
        return { url, alt: alt || fallbackAlt };
      })
      .filter((x): x is { url: string; alt: string } => x !== null) ?? [];

  const parsedImages = parseJsonIfString<unknown>(e.images as any, []);
  const legacyImages = (Array.isArray(parsedImages) ? parsedImages : [])
    .map((img) => {
      const raw = img as { url?: unknown; alt?: unknown };
      const url = typeof raw?.url === 'string' ? raw.url.trim() : '';
      if (!url) return null;
      const alt = typeof raw?.alt === 'string' ? raw.alt.trim() : '';
      return { url, alt: alt || fallbackAlt };
    })
    .filter((x): x is { url: string; alt: string } => x !== null);

  const images =
    relatedImages.length > 0
      ? relatedImages
      : legacyImages.length > 0
        ? legacyImages
        : e.imageUrl
          ? [{ url: e.imageUrl, alt: fallbackAlt }]
          : [];

  return {
    id: e.id,
    ownerUserId: e.ownerUserId ?? null,
    title: e.title,
    excerpt: e.excerpt,
    description: e.description,
    tags: e.tags,
    locationLabel: e.locationLabel,
    publishedAtLabel: formatRelativePublishedAt(Number(e.publishedAtSort)),
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
  constructor(
    @InjectRepository(OpenRequestEntity) private readonly repo: Repository<OpenRequestEntity>,
    @InjectRepository(OpenRequestImageEntity) private readonly imageRepo: Repository<OpenRequestImageEntity>,
  ) {}

  async listNearby(input: ListNearbyOpenRequestsInput): Promise<NearbyOpenRequestItem[]> {
    const limit = Math.min(100, Math.max(1, input.limit ?? 100));
    const radiusKm = input.radiusKm ?? 50;
    const distanceSql = haversineDistanceKmSql('r', ':lat', ':lng');

    const { entities, raw } = await this.repo
      .createQueryBuilder('r')
      .addSelect(distanceSql, 'distance_km')
      .where('r.locationLat IS NOT NULL')
      .andWhere('r.locationLng IS NOT NULL')
      .andWhere(`${distanceSql} <= :radiusKm`)
      .orderBy('distance_km', 'ASC')
      .take(limit)
      .setParameters({ lat: input.lat, lng: input.lng, radiusKm })
      .getRawAndEntities();

    return entities.map((e, index) => {
      const base = toListItem(e);
      const distanceKm = Math.round(Number(raw[index]?.distance_km ?? 0) * 10) / 10;
      return {
        ...base,
        locationLat: e.locationLat!,
        locationLng: e.locationLng!,
        distanceKm,
      };
    });
  }

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

  async listByOwner(
    ownerUserId: string,
    pageRequest: PageRequest,
  ): Promise<PageResult<OpenRequestListItem>> {
    const totalItems = await this.repo.count({ where: { ownerUserId } });
    const meta = buildPageMeta(totalItems, pageRequest.page, pageRequest.pageSize);

    const items = await this.repo.find({
      where: { ownerUserId },
      order: { publishedAtSort: 'DESC' as any, id: 'ASC' as any },
      skip: (meta.page - 1) * meta.pageSize,
      take: meta.pageSize,
    });

    return { items: items.map(toListItem), meta };
  }

  async getById(id: string): Promise<OpenRequestDetail | null> {
    const e = await this.repo.findOne({ where: { id }, relations: { imageRecords: true } });
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
      locationLat: input.locationLat ?? null,
      locationLng: input.locationLng ?? null,
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
    const refreshed = await this.repo.findOne({ where: { id: saved.id }, relations: { imageRecords: true } });
    return toDetail(refreshed ?? saved);
  }

  async updatePartial(id: string, patch: UpdateOpenRequestRecordPatch): Promise<OpenRequestDetail | null> {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) return null;
    if (patch.title !== undefined) e.title = patch.title;
    if (patch.excerpt !== undefined) e.excerpt = patch.excerpt;
    if (patch.description !== undefined) e.description = patch.description;
    if (patch.tags !== undefined) e.tags = patch.tags;
    if (patch.locationLabel !== undefined) e.locationLabel = patch.locationLabel;
    if (patch.locationLat !== undefined) e.locationLat = patch.locationLat;
    if (patch.locationLng !== undefined) e.locationLng = patch.locationLng;
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
    const refreshed = await this.repo.findOne({ where: { id }, relations: { imageRecords: true } });
    return refreshed ? toDetail(refreshed) : null;
  }

  async listImageRecords(
    id: string,
  ): Promise<Array<{ ownerUserId: string; url: string; alt: string; storageKey: string | null }>> {
    const rows = await this.imageRepo.find({
      where: { openRequestId: id },
      order: { createdAt: 'ASC' as any, id: 'ASC' as any },
    });
    return rows.map((row) => ({
      ownerUserId: row.ownerUserId,
      url: row.url,
      alt: row.alt,
      storageKey: row.storageKey,
    }));
  }

  async replaceImages(
    id: string,
    ownerUserId: string,
    images: { url: string; alt: string; storageKey?: string | null }[],
  ): Promise<void> {
    await this.imageRepo.delete({ openRequestId: id });
    if (images.length === 0) return;
    const rows = images.map((img) =>
      this.imageRepo.create({
        id: randomUUID(),
        openRequestId: id,
        ownerUserId,
        storageKey: img.storageKey ?? null,
        url: img.url,
        alt: img.alt,
      }),
    );
    await this.imageRepo.save(rows);
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

