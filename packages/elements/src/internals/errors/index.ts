import type { MetamaskError } from '@clerk/shared/error';
import type { ClerkAPIError } from '@clerk/shared/types';

export abstract class ClerkElementsErrorBase extends Error {
  clerkError = true;
  clerkElementsError = true;
  rawMessage: string;

  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);

    this.name = 'ClerkElementsError';
    this.rawMessage = message;
  }

  toString() {
    return `[${this.name}]\nCode: ${this.code}\nMessage: ${this.message}`;
  }
}

export class ClerkElementsError extends ClerkElementsErrorBase {
  static fromAPIError(error: ClerkAPIError | MetamaskError) {
    return new ClerkElementsError(
      error.code.toString(),
      // @ts-expect-error - Expected that longMessage isn't a property of MetamaskError
      error.longMessage || error.message,
    );
  }

  constructor(code: string, message: string) {
    super(code, message);
    this.name = 'ClerkElementsError';
  }
}

export class ClerkElementsRuntimeError extends ClerkElementsErrorBase {
  constructor(message: string) {
    super('elements_runtime_error', message);
    this.name = 'ClerkElementsRuntimeError';
  }
}

export class ClerkElementsFieldError extends ClerkElementsErrorBase {
  static fromAPIError(error: ClerkAPIError) {
    return new ClerkElementsFieldError(error.code, error.longMessage || error.message);
  }

  constructor(code: string, message: string) {
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
