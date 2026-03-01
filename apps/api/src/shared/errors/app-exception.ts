export class AppException extends Error {
  constructor(
    public readonly errorCode: string,
    message?: string,
    public readonly details?: unknown,
  ) {
    super(message ?? errorCode);
    this.name = 'AppException';
  }
}

