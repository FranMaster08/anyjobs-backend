import { getWorldCountryName, isIsoCountryCode } from './world-countries.data';

describe('world-countries.data', () => {
  it('accepts standard ISO codes', () => {
    expect(isIsoCountryCode('CO')).toBe(true);
    expect(isIsoCountryCode('ES')).toBe(true);
    expect(isIsoCountryCode('JP')).toBe(true);
  });

  it('rejects unknown codes', () => {
    expect(isIsoCountryCode('XX')).toBe(false);
    expect(isIsoCountryCode('ABC')).toBe(false);
  });

  it('resolves localized country names', () => {
    expect(getWorldCountryName('CO', 'es')).toBeTruthy();
    expect(getWorldCountryName('CO', 'en')).toBeTruthy();
  });
});
