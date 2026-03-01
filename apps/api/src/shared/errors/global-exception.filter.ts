import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { CorrelationIdService } from '../correlation/correlation-id.service';
import { createAppLogger } from '../logging/app-logger';
import { AppException } from './app-exception';
import { getCatalogEntry } from './error-catalog';

export interface ErrorResponseBody {
  status: number;
  errorCode: string;
  message: string;
  technicalMessage: string;
  correlationId: string;
  timestamp: string;
  details?: unknown;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly correlationIdService: CorrelationIdService,
    private readonly configService: ConfigService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const correlationId =
      this.correlationIdService.getCorrelationId() ||
      (typeof req.headers['x-correlation-id'] === 'string' ? req.headers['x-correlation-id'] : '') ||
      'unknown';

    const debugPayloads = this.configService.get<boolean>('logging.debugPayloads') ?? false;
    const logger = createAppLogger(GlobalExceptionFilter.name, this.correlationIdService, debugPayloads);

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL.UNEXPECTED';
    let details: unknown | undefined;

    if (exception instanceof AppException) {
      errorCode = exception.errorCode;
      details = exception.details;
      httpStatus = getCatalogEntry(errorCode).httpStatus;
    } else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      if (httpStatus === HttpStatus.UNAUTHORIZED) errorCode = 'AUTH.UNAUTHORIZED';
      else if (httpStatus === HttpStatus.FORBIDDEN) errorCode = 'AUTH.FORBIDDEN';
      else if (httpStatus === HttpStatus.BAD_REQUEST) errorCode = 'VALIDATION.INVALID_INPUT';
      else errorCode = httpStatus >= 500 ? 'INTERNAL.UNEXPECTED' : 'VALIDATION.INVALID_INPUT';

      const response = exception.getResponse();
      // Solo incluimos detalles controlados (ej. validación). Nunca stack traces.
      if (httpStatus === HttpStatus.BAD_REQUEST) {
        details = typeof response === 'object' ? response : { message: response };
      }
    }

    const entry = getCatalogEntry(errorCode);

    const body: ErrorResponseBody = {
      status: httpStatus,
      errorCode: entry.errorCode,
      message: entry.defaultClientMessage,
      technicalMessage: entry.defaultTechnicalMessage,
      correlationId,
      timestamp: new Date().toISOString(),
      ...(details ? { details } : {}),
    };

    if (httpStatus >= 500) {
      logger.error('Unhandled exception', exception, {
        errorCode,
        httpStatus,
        method: req.method,
        path: req.originalUrl || req.url,
      });
    } else {
      logger.warn('Request error', {
        errorCode,
        httpStatus,
        method: req.method,
        path: req.originalUrl || req.url,
      });
    }

    res.status(httpStatus).json(body);
  }
}

