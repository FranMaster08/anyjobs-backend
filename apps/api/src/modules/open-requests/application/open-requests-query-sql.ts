/** Join open_requests ↔ interactions when `open_request_id` puede ser varchar en BD legacy. */
export function openRequestInteractionJoinSql(
  requestAlias = 'r',
  interactionAlias = 'i',
): string {
  const isPostgres = (process.env.DB_TYPE ?? '').toLowerCase() === 'postgres';
  if (isPostgres) {
    return `${requestAlias}.id = ${interactionAlias}.open_request_id::uuid`;
  }
  return `${requestAlias}.id = ${interactionAlias}.open_request_id`;
}

/** Filtro por user_id en Postgres (parámetros TypeORM llegan como text). */
export function userIdEqualsParamSql(column: string): string {
  const isPostgres = (process.env.DB_TYPE ?? '').toLowerCase() === 'postgres';
  if (isPostgres) {
    return `${column} = CAST(:userId AS uuid)`;
  }
  return `${column} = :userId`;
}

export function interactionUserIdWhereSql(interactionAlias = 'i'): string {
  return userIdEqualsParamSql(`${interactionAlias}.user_id`);
}
