import { ClerkRuntimeError, isClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIError, ClerkRuntimeError as ClerkRuntimeErrorType } from '@clerk/shared/types';

import { handleError } from './errorHandler';

type Web3CallbackErrorHandler = {
  (err: any, setError?: (err: ClerkRuntimeErrorType | ClerkAPIError | string | undefined) => void): void;
};

export const web3CallbackErrorHandler: Web3CallbackErrorHandler = (err, setError) => {
  if (
    isClerkAPIResponseError(err) &&
    err.errors[0].meta?.paramName === 'identifier' &&
    err.errors[0].code === 'form_param_nil'
  ) {
    const error = new ClerkRuntimeError('A Web3 Wallet extension cannot be found. Please install one to continue.', {
      code: 'web3_missing_identifier',
    });

    return handleError(error, [], setError);
  }
  return handleError(err, [], setError);
};
