import type { VerificationStrategy } from '@clerk/shared/types';
import { useEffect, useRef } from 'react';

import { useCardState } from '@/ui/elements/contexts';

import type { MfaFormProps } from './mfa-form.model';

export const useMfaFormController = (availableMethods: VerificationStrategy[], props: MfaFormProps) => {
  const { error, setError } = useCardState();
  const methods = useRef([...availableMethods]).current;

  useEffect(() => {
    if (methods.length === 0 && !error) {
      setError('There are no second factors available to add');
    }
  }, [methods, error, setError]);

  return {
    hasError: !!error,
    method: props.selectedStrategy || methods[0],
    onSuccess: props.onSuccess,
    onReset: props.onReset,
  };
};
