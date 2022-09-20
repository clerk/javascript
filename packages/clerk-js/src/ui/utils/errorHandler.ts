import { ClerkAPIError } from '@clerk/types';

import { isClerkAPIResponseError, isKnownError, isMetamaskError } from '../../core/resources/internal';
import { snakeToCamel } from '../shared';
import { FormControlState } from './useFormControl';

interface ParserErrors {
  fieldErrors: ClerkAPIError[];
  globalErrors: ClerkAPIError[];
}

function setFieldErrors(fieldStates: Array<FormControlState<string>>, errors: ClerkAPIError[]) {
  if (!errors || errors.length < 1) {
    return;
  }

  fieldStates.forEach(field => {
    const error = errors.find(err => {
      return err.meta!.paramName === field.id || snakeToCamel(err.meta!.paramName) === field.id;
    });
    if (!error) {
      return;
    }
    field.setError(error || undefined);
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
  fieldStates: Array<FormControlState<string>>,
  setGlobalError?: React.Dispatch<React.SetStateAction<string | undefined>> | ((error: string | undefined) => void),
): void {
  // Throw unknown errors
  if (!isKnownError(err)) {
    throw err;
  }

  if (isMetamaskError(err)) {
    setGlobalError?.(err.message);
  }

  if (isClerkAPIResponseError(err)) {
    // Clear global and field errors
    setGlobalError?.(undefined);
    // Group errors to field and global
    const { fieldErrors, globalErrors } = parseErrors(err.errors);
    // Show field errors if applicable
    setFieldErrors(fieldStates, fieldErrors);
    // TODO: Make global errors localizable
    // Show only the first global error until we have snack bar stacks if applicable
    setGlobalError?.(globalErrors[0].longMessage || globalErrors[0].message || undefined);
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
