function clampForAcosSql(expr: string): string {
  const isPostgres = (process.env.DB_TYPE ?? '').toLowerCase() === 'postgres';
  if (isPostgres) {
    return `LEAST(1::double precision, GREATEST(-1::double precision, (${expr})::double precision))`;
  }
  return `MIN(1, MAX(-1, ${expr}))`;
}

/** Distancia Haversine en km (SQL) desde punto usuario hasta columnas lat/lng de `alias`. */
export function haversineDistanceKmSql(alias: string, latParam: string, lngParam: string): string {
  const latCol = `${alias}.location_lat`;
  const lngCol = `${alias}.location_lng`;
  const inner = `(
    cos(radians(${latParam})) * cos(radians(${latCol}))
      * cos(radians(${lngCol}) - radians(${lngParam}))
    + sin(radians(${latParam})) * sin(radians(${latCol}))
  )`;
  return `(6371 * acos(${clampForAcosSql(inner)}))`;
}

export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
