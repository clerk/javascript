import { createContextAndHook } from '@clerk/shared/react';
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
  setSuccess: (message: string) => void;
  setWarning: (warning: string) => void;
  setInfo: (info: string) => void;
  setHasPassedComplexity: (b: boolean) => void;
  clearFeedback: () => void;
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
    setSuccess,
    setWarning,
    setInfo,
    setHasPassedComplexity,
    clearFeedback,
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
        setSuccess,
        setWarning,
        setInfo,
        setHasPassedComplexity,
        clearFeedback,
      },
    }),
    [
      isRequired,
      hasError,
      id,
      errorMessageId,
      isDisabled,
      setError,
      setSuccess,
      setInfo,
      setWarning,
      setHasPassedComplexity,
      clearFeedback,
    ],
  );
  return <FormControlContext.Provider value={value}>{props.children}</FormControlContext.Provider>;
};

type FormFieldProviderProps = ReturnType<typeof useFormControlUtil<FieldId>>['props'] & {
  hasError?: boolean;
  isDisabled?: boolean;
};

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
    isDisabled = false,
    hasError = false,
    setError,
    setSuccess,
    setWarning,
    setHasPassedComplexity,
    setInfo,
    clearFeedback,
    children,
    ...rest
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
      isRequired,
      isDisabled,
      hasError,
      id,
      fieldId: propsId,
      errorMessageId,
      setError,
      setSuccess,
      setWarning,
      setInfo,
      clearFeedback,
      setHasPassedComplexity,
    }),
    [
      isRequired,
      hasError,
      id,
      propsId,
      errorMessageId,
      isDisabled,
      setError,
      setSuccess,
      setWarning,
      setInfo,
      clearFeedback,
      setHasPassedComplexity,
    ],
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
    hasPassedComplexity,
    isFocused,
    feedback,
    feedbackType,
    setHasPassedComplexity,
    setWarning,
    setSuccess,
    setError,
    setInfo,
    errorMessageId,
    fieldId,
    label,
    clearFeedback,
    infoText,
    ...inputProps
  } = obj;
  /* eslint-enable */

  keep?.forEach(key => {
    /**
     * Ignore error for the index type as we have defined it explicitly above
     */
    // @ts-ignore
    inputProps[key] = obj[key];
  });

  return inputProps;
};
