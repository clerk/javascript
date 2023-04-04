import { snakeToCamel } from '@clerk/shared';
import type { ClerkAPIError } from '@clerk/types';

import { isClerkAPIResponseError, isKnownError, isMetamaskError } from '../../core/resources/internal';
import type { FormControlState } from './useFormControl';

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
    field.setError(error || undefined);
  });
}

function parseErrors(errors: ClerkAPIError[]): ParserErrors {
  return (errors || []).reduce(
    (memo, err) => {
      if (err.meta!.paramName && err.meta!.paramName !== 'strategy') {
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

type HandleError = {
  (
    err: Error,
    fieldStates: Array<FormControlState<string>>,
    setGlobalError?: (err: ClerkAPIError | string | undefined) => void,
  ): void;
};

export const handleError: HandleError = (err, fieldStates, setGlobalError) => {
  // Throw unknown errors
  if (!isKnownError(err)) {
    throw err;
  }

  if (isMetamaskError(err)) {
    return handleMetamaskError(err, fieldStates, setGlobalError);
  }

  if (isClerkAPIResponseError(err)) {
    return handleClerkApiError(err, fieldStates, setGlobalError);
  }
};

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

const handleMetamaskError: HandleError = (err, _, setGlobalError) => {
  return setGlobalError?.(err.message);
};

const handleClerkApiError: HandleError = (err, fieldStates, setGlobalError) => {
  if (!isClerkAPIResponseError(err)) {
    return;
  }

  const { fieldErrors, globalErrors } = parseErrors(err.errors);
  setFieldErrors(fieldStates, fieldErrors);

  if (setGlobalError) {
    setGlobalError(undefined);
    // Show only the first global error until we have snack bar stacks if applicable
    // TODO: Make global errors localizable
    const firstGlobalError = globalErrors[0];
    if (firstGlobalError) {
      setGlobalError(firstGlobalError);
    }
  }
};
