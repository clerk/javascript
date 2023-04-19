import type { ClerkAPIError } from '@clerk/types';
import type { HTMLInputTypeAttribute } from 'react';
import React, { useEffect, useMemo, useState } from 'react';

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
  setError: (error: string | ClerkAPIError | undefined) => void;
  setSuccessful: (isSuccess: boolean) => void;
  isSuccessful: boolean;
  isFocused: boolean;
  debouncedState: {
    errorText: string | undefined;
    isSuccessful: boolean;
    isFocused: boolean;
    direction: string | undefined;
  };
} & Options;

export type FormControlState<Id = string> = FieldStateProps<Id> & {
  setError: (error: string | ClerkAPIError | undefined) => void;
  setSuccessful: (isSuccess: boolean) => void;
  setValue: (val: string | undefined) => void;
  setChecked: (isChecked: boolean) => void;
  props: FieldStateProps<Id>;
};

function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

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
  const [isSuccessful, setIsSuccessful] = React.useState(false);
  const [hasLostFocus, setHasLostFocus] = React.useState(false);
  const [isFocused, setFocused] = React.useState(false);

  // Not wrapping this in useMemo causes infinite re-renders
  const feedbackMemo = useMemo(() => {
    return {
      errorText: opts?.enableErrorAfterBlur ? (hasLostFocus ? errorText : '') : errorText,
      isSuccessful: opts?.enableErrorAfterBlur ? hasLostFocus && isSuccessful : isSuccessful,
      isFocused,
      direction: isFocused ? opts?.direction : '',
    };
  }, [opts.direction, opts.enableErrorAfterBlur, isFocused, isSuccessful, hasLostFocus, errorText]);

  const debouncedState = useDebounce(feedbackMemo, 300);

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
    }
  };
  const setSuccessful: FormControlState['setSuccessful'] = isSuccess => {
    setErrorText(undefined);
    setIsSuccessful(isSuccess);
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
    debouncedState,
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
