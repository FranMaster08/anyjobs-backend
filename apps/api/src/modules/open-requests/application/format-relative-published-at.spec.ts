import { formatRelativePublishedAt } from './format-relative-published-at';

const NOW = Date.UTC(2026, 4, 16, 12, 0, 0);

describe('formatRelativePublishedAt', () => {
  it('returns Recién publicado for under one minute', () => {
    expect(formatRelativePublishedAt(NOW - 30_000, NOW)).toBe('Recién publicado');
  });

  it('returns Hace 1 día for ~24 hours', () => {
    expect(formatRelativePublishedAt(NOW - 24 * 60 * 60 * 1000, NOW)).toBe('Hace 1 día');
  });

  it('returns Hace 1 mes for ~30 days', () => {
    expect(formatRelativePublishedAt(NOW - 30 * 24 * 60 * 60 * 1000, NOW)).toBe('Hace 1 mes');
  });

  it('returns Hace 1 año for ~365 days', () => {
    expect(formatRelativePublishedAt(NOW - 365 * 24 * 60 * 60 * 1000, NOW)).toBe('Hace 1 año');
  });

  it('returns Recién publicado for invalid timestamp', () => {
    expect(formatRelativePublishedAt(0, NOW)).toBe('Recién publicado');
  });
});
