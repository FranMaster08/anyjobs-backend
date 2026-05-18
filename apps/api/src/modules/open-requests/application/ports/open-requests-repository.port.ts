import type { PageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import type { NearbyOpenRequestItem, OpenRequestDetail, OpenRequestListItem } from '../../domain/open-request';

export interface ListNearbyOpenRequestsInput {
  lat: number;
  lng: number;
  limit?: number;
  radiusKm?: number;
}

export interface CreateOpenRequestRecordInput {
  id: string;
  ownerUserId: string;
  title: string;
  excerpt: string;
  description: string;
  tags: string[];
  locationLabel: string;
  locationLat?: number | null;
  locationLng?: number | null;
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
  listNearby(input: ListNearbyOpenRequestsInput): Promise<NearbyOpenRequestItem[]>;
  list(pageRequest: PageRequest): Promise<PageResult<OpenRequestListItem>>;
  listByOwner(ownerUserId: string, pageRequest: PageRequest): Promise<PageResult<OpenRequestListItem>>;
  getById(id: string): Promise<OpenRequestDetail | null>;
  create(input: CreateOpenRequestRecordInput): Promise<OpenRequestDetail>;
  updatePartial(id: string, patch: UpdateOpenRequestRecordPatch): Promise<OpenRequestDetail | null>;
  listImageRecords(
    id: string,
  ): Promise<Array<{ ownerUserId: string; url: string; alt: string; storageKey: string | null }>>;
  replaceImages(
    id: string,
    ownerUserId: string,
    images: { url: string; alt: string; storageKey?: string | null }[],
  ): Promise<void>;
  softDelete(id: string): Promise<boolean>;
  findOwnerId(id: string): Promise<{ ownerUserId: string | null } | null>;
}

