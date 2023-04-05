import { createContextAndHook } from '@clerk/shared';
import type { ClerkAPIError } from '@clerk/types';
import React from 'react';

export type FormControlProps = {
  /**
   * The custom `id` to use for the form control. This is passed directly to the form element (e.g, Input).
   * - The form element (e.g. Input) gets the `id`
   */
  id: string;
  isRequired?: boolean;
  hasError?: boolean;
  isDisabled?: boolean;
  setError: (error: string | ClerkAPIError | undefined) => void;
  setSuccessful: (isSuccess: boolean) => void;
  isSuccessful: boolean;
};

type FormControlContextValue = Required<FormControlProps> & { errorMessageId: string };

export const [FormControlContext, , useFormControl] =
  createContextAndHook<FormControlContextValue>('FormControlContext');

export const FormControlContextProvider = (props: React.PropsWithChildren<FormControlProps>) => {
  const {
    id: propsId,
    isRequired = false,
    hasError = false,
    isDisabled = false,
    setError,
    isSuccessful,
    setSuccessful,
  } = props;
  // TODO: This shouldnt be targettable
  const id = `${propsId}-field`;
  /**
   * Track whether the `FormErrorText` has been rendered.
   * We use this to append its id the `aria-describedby` of the `input`.
   */
  const errorMessageId = hasError ? `error-${propsId}` : '';
  const value = React.useMemo(
    () => ({ value: { isRequired, hasError, id, errorMessageId, isDisabled, setError, isSuccessful, setSuccessful } }),
    [isRequired, hasError, id, errorMessageId, isDisabled, setError, isSuccessful, setSuccessful],
  );
  return <FormControlContext.Provider value={value}>{props.children}</FormControlContext.Provider>;
};
