import { isAdultBirthDate, isAtLeastAge, parseBirthDateOnly } from './birth-date';

describe('birth-date', () => {
  it('parses YYYY-MM-DD', () => {
    expect(parseBirthDateOnly('1990-01-15')).toBeInstanceOf(Date);
    expect(parseBirthDateOnly('invalid')).toBeNull();
  });

  it('checks minimum age', () => {
    const reference = new Date('2026-05-16T12:00:00');
    const dob = parseBirthDateOnly('2010-05-16')!;
    expect(isAtLeastAge(dob, 18, reference)).toBe(false);
    expect(isAtLeastAge(parseBirthDateOnly('2008-05-15')!, 18, reference)).toBe(true);
  });

  it('validates adult birth date string', () => {
    expect(isAdultBirthDate('2010-05-16', 18)).toBe(false);
    expect(isAdultBirthDate('1990-01-01', 18)).toBe(true);
  });
});
