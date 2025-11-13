import { createContextAndHook } from '@clerk/shared/react';
import type { FieldId } from '@clerk/shared/types';
import React from 'react';

import type { useFormControl as useFormControlUtil } from '../../utils/useFormControl';
import { useFormControlFeedback } from '../../utils/useFormControl';

type FormFieldProviderProps = ReturnType<typeof useFormControlUtil<FieldId>>['props'] & {
  isDisabled: boolean;
};

type FormFieldContextValue = Omit<FormFieldProviderProps, 'id'> & {
  feedbackMessageId?: string;
  id?: string;
  fieldId?: FieldId;
  hasError: boolean;
  debouncedFeedback: ReturnType<typeof useFormControlFeedback>['debounced'];
};

/**
 * Extract the context hook without the guarantee in order to avoid throwing errors if our field/form primitives are not wrapped inside a Field.Root component.
 * In case our primitives need to always be wrapped with Field.Root, consider updating the following line to [FormFieldContext, useFormField]
 */
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
    feedback,
    isFocused,
    ...rest
  } = props;
  // TODO: This shouldnt be targettable
  const id = `${propsId}-field`;

  // Create a debounced version of the feedback.
  const { debounced } = useFormControlFeedback({ feedback, feedbackType, isFocused });

  // Both html attributes (e.g. data-invalid) and css styles depend on hasError being debounced
  const hasError = debounced.feedbackType === 'error';

  // Track whether any feedback message has been rendered.
  // We use this to append its id the `aria-describedby` of the `input`.
  // Use legacy pattern for errors (backwards compatible), new pattern for other types
  const feedbackMessageId = debounced.feedback
    ? debounced.feedbackType === 'error'
      ? `error-${propsId}`
      : `${propsId}-${debounced.feedbackType}-feedback`
    : '';
  const value = React.useMemo(
    () => ({
      isRequired,
      isDisabled,
      hasError,
      id,
      fieldId: propsId,
      feedbackMessageId,
      setError,
      setSuccess,
      setWarning,
      setInfo,
      clearFeedback,
      setHasPassedComplexity,
      feedbackType,
      feedback,
      isFocused,
    }),
    [
      isRequired,
      hasError,
      id,
      propsId,
      feedbackMessageId,
      isDisabled,
      setError,
      setSuccess,
      setWarning,
      setInfo,
      clearFeedback,
      setHasPassedComplexity,
      feedbackType,
      feedback,
      isFocused,
    ],
  );

  return (
    <FormFieldContext.Provider
      value={{
        value: {
          ...value,
          ...rest,
          /**
           * Keep both debounced and regular feedback state inside the context
           */
          debouncedFeedback: debounced,
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
    feedbackMessageId,
    fieldId,
    label,
    clearFeedback,
    infoText,
    debouncedFeedback,
    ignorePasswordManager,
    transformer,
    ...inputProps
  } = obj;

  keep?.forEach(key => {
    /**
     * Ignore error for the index type as we have defined it explicitly above
     */
    // @ts-ignore - Dynamic property access for form field props
    inputProps[key] = obj[key];
  });

  return inputProps;
};
