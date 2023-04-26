import type { ClerkAPIError } from '@clerk/types';
import type { HTMLInputTypeAttribute } from 'react';
import React, { useMemo } from 'react';

import { useDebounce } from '../hooks';
import type { LocalizationKey } from '../localization';
import { useLocalizations } from '../localization';

type SelectOption = { value: string; label?: string };

type Options = {
  isRequired?: boolean;
  label: string | LocalizationKey;
  placeholder?: string | LocalizationKey;
  options?: SelectOption[];
  checked?: boolean;
  enableErrorAfterBlur?: boolean;
  direction?: string;
} & (
  | {
      complexity?: never;
      strengthMeter?: never;
      type?: Exclude<HTMLInputTypeAttribute, 'password'>;
    }
  | {
      type: Extract<HTMLInputTypeAttribute, 'password'>;
      complexity: boolean;
      strengthMeter: boolean;
    }
);

type FieldStateProps<Id> = {
  id: Id;
  name: Id;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  onFocus: React.FocusEventHandler<HTMLInputElement>;
  hasLostFocus: boolean;
  errorText: string | undefined;
  warningText: string | undefined;
  setError: (error: string | ClerkAPIError | undefined) => void;
  setWarning: (error: string | undefined) => void;
  setSuccessful: (isSuccess: boolean) => void;
  isSuccessful: boolean;
  isFocused: boolean;
} & Options;

export type FormControlState<Id = string> = FieldStateProps<Id> & {
  setError: (error: string | ClerkAPIError | undefined) => void;
  setSuccessful: (isSuccess: boolean) => void;
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
    direction: '',
  };

  const { translateError } = useLocalizations();
  const [value, setValueInternal] = React.useState<string>(initialState);
  const [checked, setCheckedInternal] = React.useState<boolean>(opts?.checked || false);
  const [errorText, setErrorText] = React.useState<string | undefined>(undefined);
  const [warningText, setWarningText] = React.useState<string | undefined>(undefined);
  const [isSuccessful, setIsSuccessful] = React.useState(false);
  const [hasLostFocus, setHasLostFocus] = React.useState(false);
  const [isFocused, setFocused] = React.useState(false);

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
      setIsSuccessful(false);
      setWarningText(undefined);
    }
  };
  const setSuccessful: FormControlState['setSuccessful'] = isSuccess => {
    setErrorText(undefined);
    setWarningText(undefined);
    setIsSuccessful(isSuccess);
  };

  const setWarning: FormControlState['setWarning'] = warning => {
    setWarningText(warning || undefined);
    if (typeof warning !== 'undefined') {
      setIsSuccessful(false);
      setErrorText(undefined);
    }
  };

  if (opts.type === 'password') {
    opts.complexity = opts.complexity || false;
    opts.strengthMeter = opts.strengthMeter || false;
  }

  const props = {
    id,
    name: id,
    value,
    checked,
    errorText,
    isSuccessful,
    hasLostFocus,
    setSuccessful,
    setError,
    onChange,
    onBlur,
    onFocus,
    isFocused,
    enableErrorAfterBlur: opts.enableErrorAfterBlur || false,
    setWarning,
    warningText,
    ...opts,
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
    isSuccessful: boolean;
    isFocused: boolean;
    direction: string;
  };
};

type DebouncingOption = {
  hasLostFocus: boolean;
  warningText: string | undefined;
  errorText: string | undefined;
  enableErrorAfterBlur: boolean | undefined;
  isSuccessful: boolean;
  isFocused: boolean;
  direction: string | undefined;
};
export const useFormControlFeedback = (
  opts: DebouncingOption,
  skipBlur = false,
  delayTime = 100,
): DebouncedFeedback => {
  const {
    hasLostFocus = false,
    errorText = '',
    warningText = '',
    enableErrorAfterBlur = false,
    isSuccessful = false,
    isFocused = false,
    direction = '',
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
    const _errorText = canDisplayFeedback ? errorText : '';
    const _warningText = warningText;
    const _isSuccessful = isSuccessful;

    /*
     * On keyboard navigation avoid displaying the direction when an error is present.
     * This is necessary in order to ensure that users will still be able to see the error message
     *  even if they have pressed Enter (to submit form) and field still has focus.
     */
    const directionBehaviour = skipBlur ? isFocused && !_isSuccessful && !_errorText : isFocused && !_isSuccessful;
    return {
      errorText: _errorText,
      isSuccessful: _isSuccessful,
      warningText: _warningText,
      isFocused,
      direction: directionBehaviour ? direction : '',
    };
  }, [direction, enableErrorAfterBlur, isFocused, isSuccessful, hasLostFocus, errorText, canDisplayFeedback, skipBlur]);

  const debouncedState = useDebounce(feedbackMemo, delayTime);

  return {
    debounced: debouncedState,
  };
};
