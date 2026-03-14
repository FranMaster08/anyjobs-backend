import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buildPageMeta } from '../../../../shared/application/pagination/page-result';
import type { PageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import type { OpenRequestDetail, OpenRequestListItem } from '../../domain/open-request';
import type { OpenRequestsRepositoryPort } from '../../application/ports/open-requests-repository.port';
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
    images: parseJsonIfString(e.images as any, []),
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
}

