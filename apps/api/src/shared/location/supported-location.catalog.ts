import {
  getDivisionsForCountry,
  getMunicipalitiesForDivision,
  isDivisionValidForCountry,
  isMunicipalityValidForDivision,
} from './location-geography.data';

const AREA_MIN_LENGTH = 2;
const AREA_MAX_LENGTH = 120;

export const SUPPORTED_COUNTRY_CODES = ['CO', 'AR'] as const;
export type SupportedCountryCode = (typeof SUPPORTED_COUNTRY_CODES)[number];

export function isSupportedCountryCode(code: string): code is SupportedCountryCode {
  return (SUPPORTED_COUNTRY_CODES as readonly string[]).includes(code.trim().toUpperCase());
}

export function isCityValidForCountry(countryCode: string, city: string): boolean {
  return isDivisionValidForCountry(countryCode, city);
}

export function isMunicipalityValid(
  countryCode: string,
  divisionName: string,
  municipality: string,
): boolean {
  return isMunicipalityValidForDivision(countryCode, divisionName, municipality);
}

export interface SupportedLocationInput {
  countryCode?: string;
  city?: string;
  municipality?: string;
  area?: string;
}

export function validateSupportedLocation(input: SupportedLocationInput): Record<string, string> | null {
  const fieldErrors: Record<string, string> = {};
  const countryCode = input.countryCode?.trim().toUpperCase() ?? '';
  const division = input.city?.trim() ?? '';
  const municipality = input.municipality?.trim() ?? '';

  if (!countryCode) {
    fieldErrors.countryCode = 'Country is required.';
  } else if (!isSupportedCountryCode(countryCode)) {
    fieldErrors.countryCode = 'Country must be Colombia (CO) or Argentina (AR).';
  }

  if (!division) {
    fieldErrors.city = 'Department or province is required.';
  } else if (countryCode && isSupportedCountryCode(countryCode) && !isCityValidForCountry(countryCode, division)) {
    fieldErrors.city = 'Department or province is not valid for the selected country.';
  }

  if (!municipality) {
    fieldErrors.municipality = 'Municipality is required.';
  } else if (
    countryCode &&
    division &&
    isSupportedCountryCode(countryCode) &&
    !isMunicipalityValid(countryCode, division, municipality)
  ) {
    fieldErrors.municipality = 'Municipality is not valid for the selected department or province.';
  }

  const area = input.area?.trim() ?? '';
  if (!area) {
    fieldErrors.area = 'Neighborhood is required.';
  } else if (area.length < AREA_MIN_LENGTH) {
    fieldErrors.area = `Neighborhood must be at least ${AREA_MIN_LENGTH} characters.`;
  } else if (area.length > AREA_MAX_LENGTH) {
    fieldErrors.area = `Neighborhood must be at most ${AREA_MAX_LENGTH} characters.`;
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

export { getDivisionsForCountry, getMunicipalitiesForDivision };
