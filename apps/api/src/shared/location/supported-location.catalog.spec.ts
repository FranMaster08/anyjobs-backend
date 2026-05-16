import {
  isCityValidForCountry,
  isSupportedCountryCode,
  validateSupportedLocation,
} from './supported-location.catalog';

describe('supported-location.catalog', () => {
  it('accepts Colombia and Argentina', () => {
    expect(isSupportedCountryCode('CO')).toBe(true);
    expect(isSupportedCountryCode('AR')).toBe(true);
    expect(isSupportedCountryCode('ES')).toBe(false);
  });

  it('validates city for country', () => {
    expect(isCityValidForCountry('CO', 'Bogotá D.C.')).toBe(true);
    expect(isCityValidForCountry('CO', 'Madrid')).toBe(false);
    expect(isCityValidForCountry('AR', 'Buenos Aires')).toBe(true);
  });

  it('returns field errors for incomplete location', () => {
    expect(validateSupportedLocation({})).toEqual({
      countryCode: 'Country is required.',
      city: 'Department or province is required.',
      municipality: 'Municipality is required.',
      area: 'Neighborhood is required.',
    });
  });

  it('accepts free-text neighborhood', () => {
    expect(
      validateSupportedLocation({
        countryCode: 'CO',
        city: 'Antioquia',
        municipality: 'Medellín',
        area: 'Mi barrio personalizado',
      }),
    ).toBeNull();
  });

  it('rejects neighborhood shorter than minimum', () => {
    expect(
      validateSupportedLocation({
        countryCode: 'CO',
        city: 'Antioquia',
        municipality: 'Medellín',
        area: 'A',
      }),
    ).toEqual({ area: 'Neighborhood must be at least 2 characters.' });
  });
});
