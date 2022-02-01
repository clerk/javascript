export class HttpError extends Error {
  public statusCode: number;
  public data: unknown;

  constructor(statusCode: number, message: string, data: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }
}

export class JWTExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JWTExpiredError';
  }
}

export interface ClerkServerErrorProps {
  message: string;
  longMessage: string;
  code: string;
}

export interface ClerkServerErrorJSON {
  message: string;
  long_message: string;
  code: string;
}

export class ClerkServerError {
  public message: string;
  public longMessage: string;
  public code: string;

  constructor(data: ClerkServerErrorProps) {
    this.message = data.message;
    this.longMessage = data.longMessage;
    this.code = data.code;
  }

  static fromJSON(data: ClerkServerErrorJSON) {
    return new ClerkServerError({
      message: data.message,
      longMessage: data.long_message,
      code: data.code,
    });
  }
}
