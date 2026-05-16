import { Injectable } from '@nestjs/common';
import type { LocationCatalog } from '../../../../shared/location/location-geography.data';
import { TypeOrmLocationCatalogRepository } from '../../../../shared/persistence/repositories/typeorm-location-catalog.repository';

export type LocationCatalogResponse = LocationCatalog;

@Injectable()
export class GetLocationCatalogUseCase {
  constructor(private readonly locationCatalogRepo: TypeOrmLocationCatalogRepository) {}

  async execute(): Promise<LocationCatalogResponse> {
    return this.locationCatalogRepo.getCatalog();
  }

  async executeDivisionsByCountry(countryCode: string): Promise<string[]> {
    return this.locationCatalogRepo.getDivisionsByCountry(countryCode);
  }

  async executeMunicipalitiesByDivision(countryCode: string, division: string): Promise<string[]> {
    return this.locationCatalogRepo.getMunicipalitiesByDivision(countryCode, division);
  }
}
