/** Tiempo que permanecen las notificaciones ya leídas antes de eliminarse. */
export const READ_NOTIFICATION_RETENTION_MS = 24 * 60 * 60 * 1000;

export function readNotificationRetentionCutoff(now = Date.now()): Date {
  return new Date(now - READ_NOTIFICATION_RETENTION_MS);
}
