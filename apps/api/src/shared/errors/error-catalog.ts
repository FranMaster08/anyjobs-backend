export type ErrorSeverity = 'info' | 'warn' | 'error' | 'critical';

export interface ErrorCatalogEntry {
  errorCode: string;
  httpStatus: number;
  defaultClientMessage: string;
  defaultTechnicalMessage: string;
  severity: ErrorSeverity;
  isRetryable?: boolean;
}

export const ErrorCatalog = {
  'INTERNAL.UNEXPECTED': {
    errorCode: 'INTERNAL.UNEXPECTED',
    httpStatus: 500,
    defaultClientMessage: 'Ocurrió un error inesperado.',
    defaultTechnicalMessage: 'Unexpected error.',
    severity: 'critical',
  },
  'USER.EMAIL_ALREADY_EXISTS': {
    errorCode: 'USER.EMAIL_ALREADY_EXISTS',
    httpStatus: 409,
    defaultClientMessage: 'El email ya está en uso.',
    defaultTechnicalMessage: 'Email already exists.',
    severity: 'warn',
  },
  'USER.PHONE_ALREADY_EXISTS': {
    errorCode: 'USER.PHONE_ALREADY_EXISTS',
    httpStatus: 409,
    defaultClientMessage: 'El teléfono ya está en uso.',
    defaultTechnicalMessage: 'Phone number already exists.',
    severity: 'warn',
  },
  'USER.NOT_FOUND': {
    errorCode: 'USER.NOT_FOUND',
    httpStatus: 404,
    defaultClientMessage: 'Usuario no encontrado.',
    defaultTechnicalMessage: 'User not found.',
    severity: 'warn',
  },
  'OPEN_REQUEST.NOT_FOUND': {
    errorCode: 'OPEN_REQUEST.NOT_FOUND',
    httpStatus: 404,
    defaultClientMessage: 'Solicitud no encontrada.',
    defaultTechnicalMessage: 'Open request not found.',
    severity: 'warn',
  },
  'VALIDATION.INVALID_INPUT': {
    errorCode: 'VALIDATION.INVALID_INPUT',
    httpStatus: 400,
    defaultClientMessage: 'La solicitud es inválida.',
    defaultTechnicalMessage: 'Invalid input.',
    severity: 'warn',
  },
  'AUTH.UNAUTHORIZED': {
    errorCode: 'AUTH.UNAUTHORIZED',
    httpStatus: 401,
    defaultClientMessage: 'No autenticado.',
    defaultTechnicalMessage: 'Missing or invalid credentials.',
    severity: 'warn',
  },
  'AUTH.FORBIDDEN': {
    errorCode: 'AUTH.FORBIDDEN',
    httpStatus: 403,
    defaultClientMessage: 'No autorizado.',
    defaultTechnicalMessage: 'Insufficient permissions.',
    severity: 'warn',
  },
} as const satisfies Record<string, ErrorCatalogEntry>;

export type KnownErrorCode = keyof typeof ErrorCatalog;

export function getCatalogEntry(errorCode: string): ErrorCatalogEntry {
  return (ErrorCatalog as Record<string, ErrorCatalogEntry>)[errorCode] ?? ErrorCatalog['INTERNAL.UNEXPECTED'];
}

