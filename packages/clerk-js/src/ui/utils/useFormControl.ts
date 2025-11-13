import type { ClerkAPIError } from '@clerk/shared/types';
import type { HTMLInputTypeAttribute } from 'react';
import { useState } from 'react';

import { useDebounce } from '../hooks';
import type { LocalizationKey } from '../localization';
import { useLocalizations } from '../localization';

type SelectOption = { value: string; label?: string };

type Transformer = (value: string) => string;

type Options = {
  isRequired?: boolean;
  placeholder?: string | LocalizationKey;
  options?: SelectOption[];
  transformer?: Transformer;
  defaultChecked?: boolean;
  infoText?: LocalizationKey | string;
} & (
  | {
      label: string | LocalizationKey;
      validatePassword?: never;
      buildErrorMessage?: never;
      type?: Exclude<HTMLInputTypeAttribute, 'password' | 'radio'>;
      radioOptions?: never;
    }
  | {
      label: string | LocalizationKey;
      type: Extract<HTMLInputTypeAttribute, 'password'>;
      validatePassword: boolean;
      buildErrorMessage?: (err: ClerkAPIError[]) => ClerkAPIError | string | undefined;
      radioOptions?: never;
    }
  | {
      label: string | LocalizationKey;
      type: Extract<HTMLInputTypeAttribute, 'text'>;
      validatePassword?: never;
      buildErrorMessage?: (err: ClerkAPIError[]) => ClerkAPIError | string | undefined;
      radioOptions?: never;
    }
  | {
      validatePassword?: never;
      buildErrorMessage?: never;
      type: Extract<HTMLInputTypeAttribute, 'radio'>;
      label?: string | LocalizationKey;
      radioOptions: {
        value: string;
        label: string | LocalizationKey;
        description?: string | LocalizationKey;
      }[];
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
  feedback: string;
  feedbackType: FeedbackType;
  setError: (error: string | ClerkAPIError) => void;
  setWarning: (warning: string) => void;
  setSuccess: (message: string) => void;
  setInfo: (info: string) => void;
  setHasPassedComplexity: (b: boolean) => void;
  clearFeedback: () => void;
  hasPassedComplexity: boolean;
  isFocused: boolean;
  ignorePasswordManager?: boolean;
} & Omit<Options, 'defaultChecked'>;

export type FormControlState<Id = string> = FieldStateProps<Id> & {
  setError: (error: string | ClerkAPIError) => void;
  setSuccess: (message: string) => void;
  setInfo: (info: string) => void;
  setValue: (val: string | undefined) => void;
  setChecked: (isChecked: boolean) => void;
  clearFeedback: () => void;
  props: FieldStateProps<Id>;
};

export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

const emailTransformer = (v: string) => v.trim();
const applyTransformers = (v: string, transformers: Transformer[]) => {
  let value = v;
  for (let i = 0; i < transformers.length; i++) {
    value = transformers[i](value);
  }
  return value;
};

export const useFormControl = <Id extends string>(
  id: Id,
  initialState: string,
  opts?: Options,
): FormControlState<Id> => {
  const options = opts || {
    type: 'text',
    label: '',
    isRequired: false,
    placeholder: '',
    options: [],
    defaultChecked: false,
  };
  const transformers: Transformer[] = [];
  if (options.transformer) {
    transformers.push(options.transformer);
  }
  if (options.type === 'email') {
    transformers.push(emailTransformer);
  }

  const { translateError, t } = useLocalizations();
  const [value, setValueInternal] = useState<string>(applyTransformers(initialState, transformers));
  const [isFocused, setFocused] = useState(false);
  const [checked, setCheckedInternal] = useState<boolean>(options?.defaultChecked || false);
  const [hasPassedComplexity, setHasPassedComplexity] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: FeedbackType }>({
    message: '',
    type: 'info',
  });

  const onChange: FormControlState['onChange'] = event => {
    if (options?.type === 'checkbox') {
      return setCheckedInternal(event.target.checked);
    }
    return setValueInternal(applyTransformers(event.target.value || '', transformers));
  };

  const setValue: FormControlState['setValue'] = val => setValueInternal(val || '');
  const setChecked: FormControlState['setChecked'] = checked => setCheckedInternal(checked);
  const setError: FormControlState['setError'] = error => {
    setFeedback({ message: translateError(error), type: 'error' });
  };
  const setSuccess: FormControlState['setSuccess'] = message => {
    setFeedback({ message, type: 'success' });
  };

  const setWarning: FormControlState['setWarning'] = warning => {
    setFeedback({ message: translateError(warning), type: 'warning' });
  };

  const setInfo: FormControlState['setInfo'] = info => {
    setFeedback({ message: info, type: 'info' });
  };

  const clearFeedback: FormControlState['clearFeedback'] = () => {
    setFeedback({ message: '', type: 'info' });
  };

  const onFocus: FormControlState['onFocus'] = () => {
    setFocused(true);
  };

  const onBlur: FormControlState['onBlur'] = () => {
    setFocused(false);
  };

  const { defaultChecked, validatePassword: validatePasswordProp, buildErrorMessage, ...restOpts } = options;

  const props = {
    id,
    name: id,
    value,
    checked,
    setSuccess,
    setError,
    onChange,
    onBlur,
    onFocus,
    setWarning,
    feedback: feedback.message || t(options.infoText),
    feedbackType: feedback.type,
    setInfo,
    clearFeedback,
    hasPassedComplexity,
    setHasPassedComplexity,
    validatePassword: options.type === 'password' ? options.validatePassword : undefined,
    isFocused,
    ...restOpts,
  };

  return { props, ...props, buildErrorMessage, setError, setValue, setChecked };
};

type FormControlStateLike = Pick<FormControlState, 'id' | 'value' | 'checked' | 'type'>;

export const buildRequest = (fieldStates: Array<FormControlStateLike>): Record<string, any> => {
  const request: { [x: string]: any } = {};
  fieldStates.forEach(x => {
    request[x.id] = x.type !== 'checkbox' ? x.value : x.checked;
  });
  return request;
};

type DebouncedFeedback = {
  debounced: {
    feedback: string;
    feedbackType: FeedbackType;
  };
};

type DebouncingOption = {
  feedback?: string;
  feedbackType?: FeedbackType;
  isFocused?: boolean;
  delayInMs?: number;
};
export const useFormControlFeedback = (opts?: DebouncingOption): DebouncedFeedback => {
  const { feedback = '', delayInMs = 100, feedbackType = 'info', isFocused = false } = opts || {};
  const shouldHide = isFocused ? false : ['info', 'warning'].includes(feedbackType);

  const debouncedState = useDebounce(
    { feedback: shouldHide ? '' : feedback, feedbackType: shouldHide ? 'info' : feedbackType },
    delayInMs,
  );

  return {
    debounced: debouncedState,
  };
};
