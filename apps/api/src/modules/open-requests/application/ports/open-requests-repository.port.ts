import type { PageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import type { OpenRequestDetail, OpenRequestListItem } from '../../domain/open-request';

export interface CreateOpenRequestRecordInput {
  id: string;
  ownerUserId: string;
  title: string;
  excerpt: string;
  description: string;
  tags: string[];
  locationLabel: string;
  publishedAtLabel: string;
  publishedAtSort: number;
  budgetLabel: string;
  imageUrl: string;
  imageAlt: string;
  provider: { name: string; badge: string; subtitle: string };
  reputation: number;
  reviewsCount: number;
  providerReviews: { author: string; rating: number; dateLabel: string; text: string }[];
  contactPhone: string;
  contactEmail: string;
  images: { url: string; alt: string }[];
}

export type UpdateOpenRequestRecordPatch = Partial<
  Omit<CreateOpenRequestRecordInput, 'id' | 'ownerUserId'>
>;

export interface OpenRequestsRepositoryPort {
  list(pageRequest: PageRequest): Promise<PageResult<OpenRequestListItem>>;
  getById(id: string): Promise<OpenRequestDetail | null>;
  create(input: CreateOpenRequestRecordInput): Promise<OpenRequestDetail>;
  updatePartial(id: string, patch: UpdateOpenRequestRecordPatch): Promise<OpenRequestDetail | null>;
  softDelete(id: string): Promise<boolean>;
  findOwnerId(id: string): Promise<{ ownerUserId: string | null } | null>;
}

