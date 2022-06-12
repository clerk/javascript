import { ClerkAPIError } from '@clerk/types';

import { isClerkAPIResponseError } from '../../core/resources/internal';
import type { FieldState } from './forms';

interface ParserErrors {
  fieldErrors: ClerkAPIError[];
  globalErrors: ClerkAPIError[];
}

function clearFieldErrors(fieldStates: Array<FieldState<string>>) {
  fieldStates.forEach(field => {
    field.setError(undefined);
  });
}

function setFieldErrors(fieldStates: Array<FieldState<string>>, errors: ClerkAPIError[]) {
  if (!errors || errors.length < 1) {
    return;
  }

  fieldStates.forEach(field => {
    const error = errors.find(err => err.meta!.paramName === field.name);
    if (error) {
      field.setError(error.message);
    }
  });
}

function parseErrors(errors: ClerkAPIError[]): ParserErrors {
  return (errors || []).reduce(
    (memo, err) => {
      if (err.meta!.paramName) {
        memo.fieldErrors.push(err);
      } else {
        memo.globalErrors.push(err);
      }
      return memo;
    },
    {
      fieldErrors: Array<ClerkAPIError>(0),
      globalErrors: Array<ClerkAPIError>(0),
    },
  );
}

export function handleError(
  err: Error,
  fieldStates: Array<FieldState<string>>,
  setGlobalError?: React.Dispatch<React.SetStateAction<string | undefined>> | ((error: string | undefined) => void),
): void {
  // Throw unknown errors
  if (!isClerkAPIResponseError(err)) {
    throw err;
  }

  // Clear global and field errors
  if (typeof setGlobalError === 'function') {
    setGlobalError(undefined);
  }
  clearFieldErrors(fieldStates);

  // Group errors to field and global
  const { fieldErrors, globalErrors } = parseErrors(err.errors);

  // Show field errors if applicable
  setFieldErrors(fieldStates, fieldErrors);

  // Show only the first global error until we have snack bar stacks if applicable
  if (typeof setGlobalError === 'function' && globalErrors[0]) {
    setGlobalError(globalErrors[0].longMessage || globalErrors[0].message);
  }
}

// Returns the first global API error or undefined if none exists.
export function getGlobalError(err: Error): ClerkAPIError | undefined {
  if (!isClerkAPIResponseError(err)) {
    return;
  }
  const { globalErrors } = parseErrors(err.errors);
  if (!globalErrors.length) {
    return;
  }
  return globalErrors[0];
}

// Returns the first field API error or undefined if none exists.
export function getFieldError(err: Error): ClerkAPIError | undefined {
  if (!isClerkAPIResponseError(err)) {
    return;
  }
  const { fieldErrors } = parseErrors(err.errors);
  if (!fieldErrors.length) {
    return;
  }
  return fieldErrors[0];
}

export function getClerkAPIErrorMessage(err: ClerkAPIError): string {
  return err.longMessage || err.message;
}
