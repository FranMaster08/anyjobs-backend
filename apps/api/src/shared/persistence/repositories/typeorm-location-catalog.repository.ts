import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  buildLocationCatalogResponse,
  getMunicipalitiesForDivision,
  municipalityCatalogKey,
  type LocationCatalog,
} from '../../location/location-geography.data';
import type { SupportedCountryCode } from '../../location/supported-location.catalog';
import { GeoDivisionEntity } from '../entities/geo-division.entity';

@Injectable()
export class TypeOrmLocationCatalogRepository {
  constructor(
    @InjectRepository(GeoDivisionEntity)
    private readonly divisionRepo: Repository<GeoDivisionEntity>,
  ) {}

  async getCatalog(): Promise<LocationCatalog> {
    const divisions = await this.divisionRepo.find({
      relations: { municipalities: { neighborhoods: true } },
      order: {
        countryCode: 'ASC',
        sortOrder: 'ASC',
        municipalities: { sortOrder: 'ASC', neighborhoods: { sortOrder: 'ASC' } },
      },
    });

    if (divisions.length === 0) {
      return buildLocationCatalogResponse();
    }

    const catalog: LocationCatalog = {
      CO: { divisions: [], municipalitiesByDivision: {}, neighborhoodsByMunicipalityKey: {} },
      AR: { divisions: [], municipalitiesByDivision: {}, neighborhoodsByMunicipalityKey: {} },
    };

    for (const division of divisions) {
      const code = division.countryCode.toUpperCase() as SupportedCountryCode;
      if (!catalog[code]) continue;

      catalog[code].divisions.push(division.name);
      catalog[code].municipalitiesByDivision[division.name] = (division.municipalities ?? [])
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((m) => m.name);

      for (const municipality of division.municipalities ?? []) {
        const key = municipalityCatalogKey(division.name, municipality.name);
        catalog[code].neighborhoodsByMunicipalityKey[key] = (municipality.neighborhoods ?? [])
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((n) => n.name);
      }
    }

    return catalog;
  }

  async getDivisionsByCountry(countryCode: string): Promise<string[]> {
    const code = countryCode.trim().toUpperCase();
    const rows = await this.divisionRepo.find({
      where: { countryCode: code },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    if (rows.length === 0) {
      return [...(buildLocationCatalogResponse()[code as SupportedCountryCode]?.divisions ?? [])];
    }
    return rows.map((r) => r.name);
  }

  async getMunicipalitiesByDivision(countryCode: string, divisionName: string): Promise<string[]> {
    const division = await this.divisionRepo.findOne({
      where: { countryCode: countryCode.trim().toUpperCase(), name: divisionName.trim() },
      relations: { municipalities: true },
      order: { municipalities: { sortOrder: 'ASC', name: 'ASC' } },
    });

    if (!division?.municipalities?.length) {
      return [...getMunicipalitiesForDivision(countryCode, divisionName)];
    }

    return division.municipalities.map((m) => m.name);
  }
}
