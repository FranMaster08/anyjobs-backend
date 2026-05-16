import type { DataSource } from 'typeorm';
import { GEOGRAPHY_BY_COUNTRY } from '../../location/location-geography.data';
import type { SupportedCountryCode } from '../../location/supported-location.catalog';

async function upsertDivision(
  dataSource: DataSource,
  countryCode: string,
  name: string,
  divisionType: string,
  sortOrder: number,
): Promise<string> {
  const existing = await dataSource.query(
    `SELECT id FROM geo_divisions WHERE country_code = $1 AND name = $2 LIMIT 1`,
    [countryCode, name],
  );

  if (existing[0]?.id) {
    await dataSource.query(
      `UPDATE geo_divisions SET division_type = $1, sort_order = $2 WHERE id = $3`,
      [divisionType, sortOrder, existing[0].id],
    );
    return existing[0].id as string;
  }

  const inserted = await dataSource.query(
    `INSERT INTO geo_divisions (country_code, name, division_type, sort_order) VALUES ($1, $2, $3, $4) RETURNING id`,
    [countryCode, name, divisionType, sortOrder],
  );
  return inserted[0].id as string;
}

async function upsertMunicipality(
  dataSource: DataSource,
  divisionId: string,
  name: string,
  sortOrder: number,
): Promise<string> {
  const existing = await dataSource.query(
    `SELECT id FROM geo_municipalities WHERE division_id = $1 AND name = $2 LIMIT 1`,
    [divisionId, name],
  );

  if (existing[0]?.id) {
    await dataSource.query(`UPDATE geo_municipalities SET sort_order = $1 WHERE id = $2`, [
      sortOrder,
      existing[0].id,
    ]);
    return existing[0].id as string;
  }

  const inserted = await dataSource.query(
    `INSERT INTO geo_municipalities (division_id, name, sort_order) VALUES ($1, $2, $3) RETURNING id`,
    [divisionId, name, sortOrder],
  );
  return inserted[0].id as string;
}

async function upsertNeighborhood(
  dataSource: DataSource,
  municipalityId: string,
  name: string,
  sortOrder: number,
): Promise<void> {
  const existing = await dataSource.query(
    `SELECT id FROM geo_neighborhoods WHERE municipality_id = $1 AND name = $2 LIMIT 1`,
    [municipalityId, name],
  );

  if (existing[0]?.id) {
    await dataSource.query(`UPDATE geo_neighborhoods SET sort_order = $1 WHERE id = $2`, [
      sortOrder,
      existing[0].id,
    ]);
    return;
  }

  await dataSource.query(
    `INSERT INTO geo_neighborhoods (municipality_id, name, sort_order) VALUES ($1, $2, $3)`,
    [municipalityId, name, sortOrder],
  );
}

export async function seedGeography(dataSource: DataSource): Promise<void> {
  let divisionOrder = 0;

  for (const countryCode of Object.keys(GEOGRAPHY_BY_COUNTRY) as SupportedCountryCode[]) {
    for (const division of GEOGRAPHY_BY_COUNTRY[countryCode]) {
      divisionOrder += 1;
      const divisionId = await upsertDivision(
        dataSource,
        countryCode,
        division.name,
        division.type,
        divisionOrder,
      );

      let municipalityOrder = 0;
      for (const municipality of division.municipalities) {
        municipalityOrder += 1;
        const municipalityId = await upsertMunicipality(
          dataSource,
          divisionId,
          municipality.name,
          municipalityOrder,
        );

        let neighborhoodOrder = 0;
        for (const neighborhood of municipality.neighborhoods) {
          neighborhoodOrder += 1;
          await upsertNeighborhood(dataSource, municipalityId, neighborhood, neighborhoodOrder);
        }
      }
    }
  }
}
