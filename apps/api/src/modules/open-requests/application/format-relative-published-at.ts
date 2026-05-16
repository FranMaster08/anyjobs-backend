/**
 * Etiqueta de antigüedad relativa en español a partir de `publishedAtSort` (epoch ms).
 */
export function formatRelativePublishedAt(publishedAtSort: number, now = Date.now()): string {
  const ts = Number(publishedAtSort);
  if (!Number.isFinite(ts) || ts <= 0) {
    return 'Recién publicado';
  }

  const diffMs = Math.max(0, now - ts);
  const diffMin = Math.floor(diffMs / (60 * 1000));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Recién publicado';
  if (diffMin < 60) return diffMin === 1 ? 'Hace 1 minuto' : `Hace ${diffMin} minutos`;
  if (diffHour < 24) return diffHour === 1 ? 'Hace 1 hora' : `Hace ${diffHour} horas`;
  if (diffDay < 7) return diffDay === 1 ? 'Hace 1 día' : `Hace ${diffDay} días`;

  const diffWeek = Math.floor(diffDay / 7);
  if (diffDay < 30) return diffWeek === 1 ? 'Hace 1 semana' : `Hace ${diffWeek} semanas`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffDay < 365) return diffMonth === 1 ? 'Hace 1 mes' : `Hace ${diffMonth} meses`;

  const diffYear = Math.floor(diffDay / 365);
  return diffYear === 1 ? 'Hace 1 año' : `Hace ${diffYear} años`;
}
