export const MINIMUM_REGISTRATION_AGE = 18;

export function parseBirthDateOnly(value: string): Date | null {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const date = new Date(`${trimmed}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isAtLeastAge(
  birthDate: Date,
  minAge: number,
  referenceDate: Date = new Date(),
): boolean {
  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age >= minAge;
}

export function isAdultBirthDate(value: string, minAge = MINIMUM_REGISTRATION_AGE): boolean {
  const birthDate = parseBirthDateOnly(value);
  return birthDate !== null && isAtLeastAge(birthDate, minAge);
}
