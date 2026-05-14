import { ApiProperty } from '@nestjs/swagger';

/**
 * Métricas expuestas solo cuando hay fuente real en BD (conteos).
 * `completedOpenRequests` queda reservado para cuando exista estado de cierre en open_requests.
 */
export class UserProfileMetricsDto {
  @ApiProperty({ description: 'Solicitudes abiertas publicadas por el usuario (no borradas).' })
  openRequestsPublished!: number;

  @ApiProperty({ description: 'Propuestas/postulaciones enviadas por el usuario.' })
  proposalsSent!: number;
}
