import type { ClerkAPIError } from '@clerk/types';

export class ClerkElementsError extends Error {
  clerkError = true;
  clerkElementsError = true;

  static fromAPIError(error: ClerkAPIError) {
    return new ClerkElementsError(error.code, error.longMessage || error.message);
  }

  constructor(readonly code: string, message: string) {
    super(message);
    this.name = 'ClerkElementsError';
  }

  toString() {
    return `[${this.name}]\nCode: ${this.code}\nMessage: ${this.message}`;
  }
}

export class ClerkElementsFieldError extends ClerkElementsError {
  static fromAPIError(error: ClerkAPIError) {
    return new ClerkElementsFieldError(error.code, error.longMessage || error.message);
  }

  constructor(readonly code: string, message: string) {
    super(code, message);
    this.name = 'ClerkElementsFieldError';
  }

  get validityState() {
    return this.code;
  }

  get forceMatch() {
    return true;
  }

  matchFn = () => true;
}
