/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContextAndHook } from '@clerk/shared';
import type { ClerkAPIError, FieldId } from '@clerk/types';
import React from 'react';

import type { useFormControl as useFormControlUtil } from '../../utils/useFormControl';

/**
 * @deprecated
 */
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
  setSuccessful: (message: string) => void;
  setWarning: (message: string) => void;
  setHasPassedComplexity: (b: boolean) => void;
};

/**
 * @deprecated
 */
type FormControlContextValue = Required<FormControlProps> & { errorMessageId: string };

/**
 * @deprecated Use FormFieldContextProvider
 */
export const [FormControlContext, , useFormControl] =
  createContextAndHook<FormControlContextValue>('FormControlContext');

/**
 * @deprecated Use FormFieldContextProvider
 */
export const FormControlContextProvider = (props: React.PropsWithChildren<FormControlProps>) => {
  const {
    id: propsId,
    isRequired = false,
    hasError = false,
    isDisabled = false,
    setError,
    setSuccessful,
    setWarning,
    setHasPassedComplexity,
  } = props;
  // TODO: This shouldnt be targettable
  const id = `${propsId}-field`;
  /**
   * Track whether the `FormErrorText` has been rendered.
   * We use this to append its id the `aria-describedby` of the `input`.
   */
  const errorMessageId = hasError ? `error-${propsId}` : '';
  const value = React.useMemo(
    () => ({
      value: {
        isRequired,
        hasError,
        id,
        errorMessageId,
        isDisabled,
        setError,
        setSuccessful,
        setWarning,
        setHasPassedComplexity,
      },
    }),
    [isRequired, hasError, id, errorMessageId, isDisabled, setError, setSuccessful, setHasPassedComplexity],
  );
  return <FormControlContext.Provider value={value}>{props.children}</FormControlContext.Provider>;
};

type FormFieldProviderProps = ReturnType<typeof useFormControlUtil<FieldId>>['props'];

type FormFieldContextValue = Omit<FormFieldProviderProps, 'id'> & {
  errorMessageId?: string;
  id?: string;
  fieldId?: FieldId;
};
export const [FormFieldContext, useFormField] = createContextAndHook<FormFieldContextValue>('FormFieldContext');

export const FormFieldContextProvider = (props: React.PropsWithChildren<FormFieldProviderProps>) => {
  const {
    id: propsId,
    isRequired = false,
    setError,
    setSuccessful,
    setWarning,
    setHasPassedComplexity,
    children,
    ...rest
  } = props;
  // TODO: This shouldnt be targettable
  const id = `${propsId}-field`;

  /**
   * Track whether the `FormErrorText` has been rendered.
   * We use this to append its id the `aria-describedby` of the `input`.
   */
  const errorMessageId = rest.errorText ? `error-${propsId}` : '';
  const value = React.useMemo(
    () => ({
      isRequired,
      id,
      fieldId: propsId,
      errorMessageId,
      setError,
      setSuccessful,
      setWarning,
      setHasPassedComplexity,
    }),
    [isRequired, id, errorMessageId, setError, setSuccessful, setHasPassedComplexity],
  );
  return (
    <FormFieldContext.Provider
      value={{
        value: {
          ...value,
          ...rest,
        },
      }}
    >
      {props.children}
    </FormFieldContext.Provider>
  );
};

export const sanitizeInputProps = (
  obj: ReturnType<typeof useFormField>,
  keep?: (keyof ReturnType<typeof useFormField>)[],
) => {
  const {
    radioOptions,
    validatePassword,
    warningText,
    informationText,
    hasPassedComplexity,
    enableErrorAfterBlur,
    isFocused,
    hasLostFocus,
    successfulText,
    errorText,
    setHasPassedComplexity,
    setWarning,
    setSuccessful,
    setError,
    errorMessageId,
    fieldId,
    label,
    ...inputProps
  } = obj;

  keep?.forEach(key => {
    // @ts-ignore
    inputProps[key] = obj[key];
  });

  return inputProps;
};
