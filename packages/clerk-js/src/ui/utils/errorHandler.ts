import { isClerkAPIResponseError, isClerkRuntimeError, isKnownError, isMetamaskError } from '@clerk/shared/error';
import type { ClerkAPIError, ClerkRuntimeError } from '@clerk/shared/types';
import { snakeToCamel } from '@clerk/shared/underscore';

import type { FormControlState } from './useFormControl';

interface ParserErrors {
  fieldErrors: ClerkAPIError[];
  globalErrors: ClerkAPIError[];
}

const getFirstError = (err: ClerkAPIError[]) => err[0];

function setFieldErrors(fieldStates: Array<FormControlState<string>>, errors: ClerkAPIError[]) {
  if (!errors || errors.length < 1) {
    return;
  }

  fieldStates.forEach(field => {
    let buildErrorMessage = field?.buildErrorMessage;

    if (!buildErrorMessage) {
      buildErrorMessage = getFirstError;
    }

    const errorsArray = errors.filter(err => {
      return err.meta?.paramName === field.id || snakeToCamel(err.meta?.paramName) === field.id;
    });

    const errorMessage = buildErrorMessage(errorsArray);
    if (errorsArray.length && errorMessage) {
      field.setError(errorMessage);
    } else {
      field.clearFeedback();
    }
  });
}

function parseErrors(errors: ClerkAPIError[]): ParserErrors {
  return (errors || []).reduce(
    (memo, err) => {
      if (err.meta?.paramName) {
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
    setGlobalError?: (err: ClerkRuntimeError | ClerkAPIError | string | undefined) => void,
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

  if (isClerkRuntimeError(err) && err.code === 'reverification_cancelled') {
    // Don't log or display an error for cancelled reverification, the user simply closed the modal.
    return;
  }

  if (isClerkRuntimeError(err)) {
    return handleClerkRuntimeError(err, fieldStates, setGlobalError);
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

const handleClerkRuntimeError: HandleError = (err, _, setGlobalError) => {
  if (!isClerkRuntimeError(err)) {
    return;
  }

  if (setGlobalError) {
    setGlobalError(undefined);
    const firstGlobalError = err;
    if (firstGlobalError) {
      setGlobalError(firstGlobalError);
    }
  }
};
