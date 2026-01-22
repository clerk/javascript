import type { ClerkError, ClerkErrorsResponse } from './types';

/**
 * Base error class for Clerk Platform API errors
 */
export class ClerkPlatformError extends Error {
  /**
   * The HTTP status code of the response
   */
  public readonly status: number;

  /**
   * The Clerk trace ID for debugging
   */
  public readonly clerkTraceId?: string;

  /**
   * Array of individual errors from the API response
   */
  public readonly errors: ClerkError[];

  /**
   * Additional metadata from the error response
   */
  public readonly meta?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    errors: ClerkError[] = [],
    clerkTraceId?: string,
    meta?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ClerkPlatformError';
    this.status = status;
    this.errors = errors;
    this.clerkTraceId = clerkTraceId;
    this.meta = meta;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ClerkPlatformError);
    }
  }

  /**
   * Create an error instance from an API response
   */
  static async fromResponse(response: Response): Promise<ClerkPlatformError> {
    let errorData: ClerkErrorsResponse | undefined;
    let message = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const text = await response.text();
      if (text) {
        errorData = JSON.parse(text) as ClerkErrorsResponse;
        if (errorData.errors && errorData.errors.length > 0) {
          message = errorData.errors.map(e => e.message).join('; ');
        }
      }
    } catch {
      // If we can't parse the response, use the default message
    }

    return new ClerkPlatformError(
      message,
      response.status,
      errorData?.errors ?? [],
      errorData?.clerk_trace_id,
      errorData?.meta,
    );
  }
}

/**
 * Error thrown when the API request is invalid (400)
 */
export class BadRequestError extends ClerkPlatformError {
  constructor(errors: ClerkError[] = [], clerkTraceId?: string, meta?: Record<string, unknown>) {
    super(errors.length > 0 ? errors.map(e => e.message).join('; ') : 'Bad request', 400, errors, clerkTraceId, meta);
    this.name = 'BadRequestError';
  }
}

/**
 * Error thrown when authentication fails (401)
 */
export class AuthenticationError extends ClerkPlatformError {
  constructor(errors: ClerkError[] = [], clerkTraceId?: string, meta?: Record<string, unknown>) {
    super(
      errors.length > 0 ? errors.map(e => e.message).join('; ') : 'Authentication invalid',
      401,
      errors,
      clerkTraceId,
      meta,
    );
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when authorization fails (403)
 */
export class AuthorizationError extends ClerkPlatformError {
  constructor(errors: ClerkError[] = [], clerkTraceId?: string, meta?: Record<string, unknown>) {
    super(
      errors.length > 0 ? errors.map(e => e.message).join('; ') : 'Authorization invalid',
      403,
      errors,
      clerkTraceId,
      meta,
    );
    this.name = 'AuthorizationError';
  }
}

/**
 * Error thrown when a resource is not found (404)
 */
export class NotFoundError extends ClerkPlatformError {
  constructor(errors: ClerkError[] = [], clerkTraceId?: string, meta?: Record<string, unknown>) {
    super(
      errors.length > 0 ? errors.map(e => e.message).join('; ') : 'Resource not found',
      404,
      errors,
      clerkTraceId,
      meta,
    );
    this.name = 'NotFoundError';
  }
}

/**
 * Error thrown when there's a conflict (409)
 */
export class ConflictError extends ClerkPlatformError {
  constructor(errors: ClerkError[] = [], clerkTraceId?: string, meta?: Record<string, unknown>) {
    super(errors.length > 0 ? errors.map(e => e.message).join('; ') : 'Conflict', 409, errors, clerkTraceId, meta);
    this.name = 'ConflictError';
  }
}

/**
 * Error thrown when request parameters are invalid (422)
 */
export class UnprocessableEntityError extends ClerkPlatformError {
  constructor(errors: ClerkError[] = [], clerkTraceId?: string, meta?: Record<string, unknown>) {
    super(
      errors.length > 0 ? errors.map(e => e.message).join('; ') : 'Invalid request parameters',
      422,
      errors,
      clerkTraceId,
      meta,
    );
    this.name = 'UnprocessableEntityError';
  }
}

/**
 * Error thrown when the request times out
 */
export class TimeoutError extends Error {
  public readonly timeout: number;

  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = 'TimeoutError';
    this.timeout = timeout;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TimeoutError);
    }
  }
}

/**
 * Create an appropriate error class based on HTTP status code
 */
export async function createErrorFromResponse(response: Response): Promise<ClerkPlatformError> {
  let errorData: ClerkErrorsResponse | undefined;

  try {
    const text = await response.text();
    if (text) {
      errorData = JSON.parse(text) as ClerkErrorsResponse;
    }
  } catch {
    // If we can't parse the response, create a generic error
  }

  const errors = errorData?.errors ?? [];
  const clerkTraceId = errorData?.clerk_trace_id;
  const meta = errorData?.meta;

  switch (response.status) {
    case 400:
      return new BadRequestError(errors, clerkTraceId, meta);
    case 401:
      return new AuthenticationError(errors, clerkTraceId, meta);
    case 403:
      return new AuthorizationError(errors, clerkTraceId, meta);
    case 404:
      return new NotFoundError(errors, clerkTraceId, meta);
    case 409:
      return new ConflictError(errors, clerkTraceId, meta);
    case 422:
      return new UnprocessableEntityError(errors, clerkTraceId, meta);
    default:
      return new ClerkPlatformError(
        errors.length > 0 ? errors.map(e => e.message).join('; ') : `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errors,
        clerkTraceId,
        meta,
      );
  }
}
