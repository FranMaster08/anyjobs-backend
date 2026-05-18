import { Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../../../shared/errors/app-exception';
import { OPEN_REQUESTS_REPOSITORY } from '../ports';
import type { OpenRequestsRepositoryPort } from '../ports';
import type { NearbyOpenRequestItem } from '../../domain';

export interface ListNearbyOpenRequestsUseCaseInput {
  lat?: number;
  lng?: number;
  limit?: number;
  radiusKm?: number;
}

export interface ListNearbyOpenRequestsResult {
  items: NearbyOpenRequestItem[];
}

@Injectable()
export class ListNearbyOpenRequestsUseCase {
  constructor(@Inject(OPEN_REQUESTS_REPOSITORY) private readonly repo: OpenRequestsRepositoryPort) {}

  async execute(input: ListNearbyOpenRequestsUseCaseInput): Promise<ListNearbyOpenRequestsResult> {
    const lat = input.lat;
    const lng = input.lng;
    if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
      throw new AppException('VALIDATION.INVALID_INPUT', 'lat and lng are required', {
        lat: 'Required',
        lng: 'Required',
      });
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new AppException('VALIDATION.INVALID_INPUT', 'Invalid coordinates', {
        lat: 'Must be between -90 and 90',
        lng: 'Must be between -180 and 180',
      });
    }

    const limit = input.limit != null ? Math.min(100, Math.max(1, input.limit)) : 100;
    const items = await this.repo.listNearby({
      lat,
      lng,
      limit,
      radiusKm: input.radiusKm,
    });
    return { items };
  }
}
