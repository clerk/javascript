import { createContextAndHook } from '@clerk/shared/react';
import type { FieldId } from '@clerk/types';
import React from 'react';

import type { useFormControl as useFormControlUtil } from '../../utils/useFormControl';

type FormFieldProviderProps = ReturnType<typeof useFormControlUtil<FieldId>>['props'] & {
  isDisabled: boolean;
};

type FormFieldContextValue = Omit<FormFieldProviderProps, 'id'> & {
  errorMessageId?: string;
  id?: string;
  fieldId?: FieldId;
  hasError: boolean;
};
export const [FormFieldContext, , useFormField] = createContextAndHook<FormFieldContextValue>('FormFieldContext');

export const FormFieldContextProvider = (props: React.PropsWithChildren<FormFieldProviderProps>) => {
  const {
    id: propsId,
    isRequired = false,
    isDisabled = false,
    setError,
    setSuccess,
    setWarning,
    setHasPassedComplexity,
    setInfo,
    clearFeedback,
    children,
    feedbackType,
    ...rest
  } = props;
  // The following TODO existed beforehand, it is simply copied during the refactor
  // TODO: This shouldnt be targettable
  const id = `${propsId}-field`;

  const hasError = feedbackType === 'error';
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
      feedbackType,
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
      feedbackType,
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

/**
 * Each of our Form primitives depend on different custom props
 * This utility filters out any props that will litter the DOM, but allows for exceptions when the `keep` param is used.
 * This allows for maintainers to opt-in and only allow for specific props to be passed for each primitive.
 */
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
