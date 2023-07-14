import type { ClerkAPIError } from '@clerk/types';
import type { HTMLInputTypeAttribute } from 'react';
import React, { useMemo } from 'react';

import { useSetTimeout } from '../hooks';
import type { LocalizationKey } from '../localization';
import { useLocalizations } from '../localization';

type SelectOption = { value: string; label?: string };

type Options = {
  isRequired?: boolean;
  label: string | LocalizationKey;
  placeholder?: string | LocalizationKey;
  options?: SelectOption[];
  defaultChecked?: boolean;
  enableErrorAfterBlur?: boolean;
  informationText?: string;
} & (
  | {
      validatePassword?: never;
      type?: Exclude<HTMLInputTypeAttribute, 'password'>;
    }
  | {
      type: Extract<HTMLInputTypeAttribute, 'password'>;
      validatePassword: boolean;
    }
);

type FieldStateProps<Id> = {
  id: Id;
  name: Id;
  value: string;
  checked?: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  onFocus: React.FocusEventHandler<HTMLInputElement>;
  hasLostFocus: boolean;
  errorText: string | undefined;
  warningText: string;
  setError: (error: string | ClerkAPIError | undefined) => void;
  setWarning: (message: string) => void;
  setSuccessful: (message: string) => void;
  setHasPassedComplexity: (b: boolean) => void;
  hasPassedComplexity: boolean;
  successfulText: string;
  isFocused: boolean;
} & Omit<Options, 'defaultChecked'>;

export type FormControlState<Id = string> = FieldStateProps<Id> & {
  setError: (error: string | ClerkAPIError | undefined) => void;
  setSuccessful: (message: string) => void;
  setValue: (val: string | undefined) => void;
  setChecked: (isChecked: boolean) => void;
  props: FieldStateProps<Id>;
};

export const useFormControl = <Id extends string>(
  id: Id,
  initialState: string,
  opts?: Options,
): FormControlState<Id> => {
  opts = opts || {
    type: 'text',
    label: '',
    isRequired: false,
    placeholder: '',
    options: [],
    enableErrorAfterBlur: false,
    informationText: '',
    defaultChecked: false,
  };

  const { translateError } = useLocalizations();
  const [value, setValueInternal] = React.useState<string>(initialState);
  const [checked, setCheckedInternal] = React.useState<boolean>(opts?.defaultChecked || false);
  const [errorText, setErrorText] = React.useState<string | undefined>(undefined);
  const [warningText, setWarningText] = React.useState('');
  const [successfulText, setSuccessfulText] = React.useState('');
  const [hasLostFocus, setHasLostFocus] = React.useState(false);
  const [isFocused, setFocused] = React.useState(false);
  const [hasPassedComplexity, setHasPassedComplexity] = React.useState(false);

  const onChange: FormControlState['onChange'] = event => {
    if (opts?.type === 'checkbox') {
      return setCheckedInternal(event.target.checked);
    }
    return setValueInternal(event.target.value || '');
  };

  const onFocus: FormControlState['onFocus'] = () => {
    setFocused(true);
  };

  const onBlur: FormControlState['onBlur'] = () => {
    setFocused(false);
    setHasLostFocus(true);
  };

  const setValue: FormControlState['setValue'] = val => setValueInternal(val || '');
  const setChecked: FormControlState['setChecked'] = checked => setCheckedInternal(checked);
  const setError: FormControlState['setError'] = error => {
    setErrorText(translateError(error || undefined));
    if (typeof error !== 'undefined') {
      setSuccessfulText('');
      setWarningText('');
    }
  };
  const setSuccessful: FormControlState['setSuccessful'] = isSuccess => {
    setErrorText('');
    setWarningText('');
    setSuccessfulText(isSuccess);
  };

  const setWarning: FormControlState['setWarning'] = warning => {
    setWarningText(warning);
    if (warning) {
      setSuccessfulText('');
      setErrorText('');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultChecked, validatePassword: validatePasswordProp, ...restOpts } = opts;

  const props = {
    id,
    name: id,
    value,
    checked,
    errorText,
    successfulText,
    hasLostFocus,
    setSuccessful,
    setError,
    onChange,
    onBlur,
    onFocus,
    isFocused,
    enableErrorAfterBlur: restOpts.enableErrorAfterBlur || false,
    setWarning,
    warningText,
    hasPassedComplexity,
    setHasPassedComplexity,
    validatePassword: opts.type === 'password' ? opts.validatePassword : undefined,
    ...restOpts,
  };

  return { props, ...props, setError, setValue, setChecked };
};

type FormControlStateLike = Pick<FormControlState, 'id' | 'value'>;

export const buildRequest = (fieldStates: Array<FormControlStateLike>): Record<string, any> => {
  const request: { [x: string]: any } = {};
  fieldStates.forEach(x => {
    request[x.id] = x.value;
  });
  return request;
};

type DebouncedFeedback = {
  debounced: {
    errorText: string;
    warningText: string;
    successfulText: string;
    isFocused: boolean;
    informationText: string;
  };
};

type DebouncingOption = {
  hasLostFocus: boolean;
  warningText: string | undefined;
  errorText: string | undefined;
  enableErrorAfterBlur: boolean | undefined;
  successfulText: string | undefined;
  isFocused: boolean;
  informationText: string | undefined;
  hasPassedComplexity: boolean;
  skipBlur?: boolean;
  delayInMs?: number;
};
export const useFormControlFeedback = (opts: DebouncingOption): DebouncedFeedback => {
  const {
    hasLostFocus = false,
    errorText = '',
    warningText = '',
    enableErrorAfterBlur = false,
    successfulText = '',
    isFocused = false,
    informationText = '',
    skipBlur = false,
    delayInMs = 100,
    hasPassedComplexity = false,
  } = opts;

  const canDisplayFeedback = useMemo(() => {
    if (enableErrorAfterBlur) {
      if (skipBlur) {
        return true;
      }
      return hasLostFocus;
    }
    return true;
  }, [enableErrorAfterBlur, hasLostFocus, skipBlur]);

  const feedbackMemo = useMemo(() => {
    const shouldDisplayErrorAsWarning = hasPassedComplexity ? errorText && !hasLostFocus : false;
    const _errorText = !shouldDisplayErrorAsWarning && canDisplayFeedback ? errorText : '';
    const _warningText = shouldDisplayErrorAsWarning ? errorText : warningText;
    const _successfulText = successfulText;

    /*
     * On keyboard navigation avoid displaying the information text when an error is present.
     * This is necessary in order to ensure that users will still be able to see the error message
     *  even if they have pressed Enter (to submit form) and field still has focus.
     */
    const shouldShowInformationText = skipBlur
      ? isFocused && !_successfulText && !_errorText
      : isFocused && !_successfulText;
    return {
      errorText: _errorText,
      successfulText: _successfulText,
      warningText: _warningText,
      isFocused,
      informationText: shouldShowInformationText ? informationText : '',
    };
  }, [
    informationText,
    enableErrorAfterBlur,
    isFocused,
    successfulText,
    hasLostFocus,
    errorText,
    canDisplayFeedback,
    skipBlur,
  ]);

  const debouncedState = useSetTimeout(feedbackMemo, delayInMs);

  return {
    debounced: debouncedState,
  };
};
