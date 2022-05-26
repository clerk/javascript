import React from 'react';

export type FormControlOptions = {
  /**
   * If `true`, the form control will be required.
   * - The form element (e.g, Input) will have `aria-required` set to `true`
   */
  isRequired?: boolean;
  /**
   * If `true`, the form control will be invalid. This has 2 side effects:
   * - The form element (e.g, Input) will have `aria-invalid` set to `true`
   * - The FormErrorText will render
   */
  hasError?: boolean;

  /**
   * The custom `id` to use for the form control. This is passed directly to the form element (e.g, Input).
   * - The form element (e.g. Input) gets the `id`
   */
  id: string;
};

type FormControlProviderContext = ReturnType<typeof useFormControlProvider>;

export const FormControlContext = React.createContext<FormControlProviderContext | Record<string, never>>({});
export const useFormControlContext = () => React.useContext(FormControlContext);

export function useFormControlProvider(props: FormControlOptions) {
  const { id: propsId, isRequired, hasError } = props;

  /**
   * Track whether the `FormErrorText` has been rendered.
   * We use this to append its id the `aria-describedby` of the `input`.
   */
  const id = `cl-form-control-${propsId}`;
  const errorMessageId = hasError && `error-${propsId}`;

  return {
    isRequired,
    hasError,
    id,
    errorMessageId,
  };
}
