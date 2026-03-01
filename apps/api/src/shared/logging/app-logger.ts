import { Logger } from '@nestjs/common';
import { CorrelationIdService } from '../correlation/correlation-id.service';
import { sanitizeForLogging } from './sanitize';

type LogLevel = 'debug' | 'log' | 'warn' | 'error';

export class AppLogger {
  private readonly logger: Logger;

  constructor(
    private readonly context: string,
    private readonly correlationIdService: CorrelationIdService,
    private readonly debugPayloads: boolean,
  ) {
    this.logger = new Logger(context);
  }

  private format(message: string, metadata?: unknown) {
    const correlationId = this.correlationIdService.getCorrelationId();
    const base = correlationId ? `[correlationId=${correlationId}] ${message}` : message;

    if (!metadata) return base;
    if (!this.debugPayloads) return base;

    return `${base} | meta=${JSON.stringify(sanitizeForLogging(metadata))}`;
  }

  debug(message: string, metadata?: unknown) {
    this.logger.debug(this.format(message, metadata));
  }

  log(message: string, metadata?: unknown) {
    this.logger.log(this.format(message, metadata));
  }

  warn(message: string, metadata?: unknown) {
    this.logger.warn(this.format(message, metadata));
  }

  error(message: string, err?: unknown, metadata?: unknown) {
    const correlationId = this.correlationIdService.getCorrelationId();
    const base = correlationId ? `[correlationId=${correlationId}] ${message}` : message;

    const stack =
      err instanceof Error
        ? err.stack
        : typeof err === 'string'
          ? err
          : err
            ? JSON.stringify(sanitizeForLogging(err))
            : undefined;

    if (!metadata || !this.debugPayloads) {
      this.logger.error(base, stack);
      return;
    }

    this.logger.error(`${base} | meta=${JSON.stringify(sanitizeForLogging(metadata))}`, stack);
  }
}

export function createAppLogger(
  context: string,
  correlationIdService: CorrelationIdService,
  debugPayloads: boolean,
): AppLogger {
  return new AppLogger(context, correlationIdService, debugPayloads);
}

export const logLevelOrder: LogLevel[] = ['debug', 'log', 'warn', 'error'];

export function nestLoggerLevels(level: LogLevel): LogLevel[] {
  const idx = logLevelOrder.indexOf(level);
  if (idx === -1) return ['log', 'warn', 'error'];
  return logLevelOrder.slice(idx);
}

