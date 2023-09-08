import { createContextAndHook } from '@clerk/shared';
import type { ClerkAPIError, FieldId } from '@clerk/types';
import type { HTMLInputTypeAttribute } from 'react';
import React from 'react';

import type { LocalizationKey } from '../../localization';

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

type FormFieldContextValue = Omit<FormFieldProps, 'id'> & {
  errorMessageId: string;
  id?: string;
  fieldId?: FieldId;
};
export const [FormFieldContext, useFormField] = createContextAndHook<FormFieldContextValue>('FormFieldContext');

type SelectOption = { value: string; label?: string };

type Options = {
  isRequired?: boolean;
  placeholder?: string | LocalizationKey;
  options?: SelectOption[];
  defaultChecked?: boolean;
  enableErrorAfterBlur?: boolean;
  informationText?: string | LocalizationKey;
  type?: HTMLInputTypeAttribute;
  label?: string | LocalizationKey;
  validatePassword?: boolean;
  buildErrorMessage?: (err: ClerkAPIError[]) => ClerkAPIError | string | undefined;
  radioOptions?: {
    value: string;
    label: string | LocalizationKey;
    description?: string | LocalizationKey;
  }[];
};

type FormFieldProps = {
  id?: FieldId;
  name?: string;
  value?: string | number | readonly string[];
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  hasLostFocus: boolean;
  errorText?: string;
  warningText?: string;
  setError: (error: string | ClerkAPIError | undefined) => void;
  setWarning: (message: string) => void;
  setSuccessful: (message: string) => void;
  setHasPassedComplexity: (b: boolean) => void;
  hasPassedComplexity: boolean;
  successfulText?: string;
  isFocused: boolean;
  isDisabled?: boolean;
  hasError?: boolean;
} & Omit<Options, 'defaultChecked'>;

export const FormFieldContextProvider = (props: React.PropsWithChildren<FormFieldProps>) => {
  const {
    id: propsId,
    isRequired = false,
    hasError = false,
    isDisabled = false,
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
  const errorMessageId = hasError ? `error-${propsId}` : '';
  const value = React.useMemo(
    () => ({
      isRequired,
      hasError,
      id,
      fieldId: propsId,
      errorMessageId,
      isDisabled,
      setError,
      setSuccessful,
      setWarning,
      setHasPassedComplexity,
    }),
    [isRequired, hasError, id, errorMessageId, isDisabled, setError, setSuccessful, setHasPassedComplexity],
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
