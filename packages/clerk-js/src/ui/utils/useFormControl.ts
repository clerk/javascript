import type { ClerkAPIError } from '@clerk/types';
import type { HTMLInputTypeAttribute } from 'react';
import { useRef, useSyncExternalStore } from 'react';

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
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => string | undefined;
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

class Store<T> {
  private state: T;
  private listeners: ((newState: T) => void)[] = [];

  constructor(initialState: T) {
    this.state = initialState;
  }

  public _g(): T;
  public _g<K>(select: (state: T) => K): K;
  public _g<K>(select?: (state: T) => K): T | K {
    if (select) {
      return select(this.state);
    }
    return this.state;
  }

  public _s(newState: Partial<T> | ((prevState: T) => T)): void {
    this.state =
      typeof newState === 'function' ? (newState as (prevState: T) => T)(this.state) : { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  public _sub(listener: (selectedState: T) => void): () => void;
  public _sub<K>(listener: (selectedState: K) => void, select: (state: T) => K): () => void;
  public _sub<K>(listener: (selectedState: any) => void, select?: (state: T) => K): () => void {
    const notify = () => {
      const selectedState = select ? select(this.state) : this.state;
      listener(selectedState);
    };

    this.listeners.push(notify);
    notify(); // Notify immediately on subscription

    return () => {
      this.listeners = this.listeners.filter(l => l !== notify);
    };
  }
}

const allStores = new Map<string, Store<{ [key: string]: FieldStateProps<string> }>>();

export const useForm = (key: string): Store<{ [key: string]: FieldStateProps<string> }> => {
  if (!allStores.has(key)) {
    allStores.set(key, new Store<any>({}));
  }
  return allStores.get(key)!;
};

// export const useFormSelector = <T extends FieldStateProps<string> | undefined, K>(
//   key: string,
//   fieldId: string,
//   selector: (state: T) => K,
// ) => {
//   const store = allStores.get(key);
//
//   if (!store) {
//     throw new Error(`Store with key ${key} not found`);
//   }
//
//   return useSyncExternalStore(
//     (a: any) =>
//       store.subscribe(a, (v: any) => {
//         return selector(v?.[fieldId]);
//       }),
//     () =>
//       store.getState((v: any) => {
//         return selector(v?.[fieldId]);
//       }),
//   );
// };

type ControlState<Id> = {
  id: Id;
  name: Id;
  value: string;
  checked?: boolean;
  feedback: string;
  feedbackType: FeedbackType;
  hasPassedComplexity: boolean;
  isFocused: boolean;
} & Partial<Options>;

export type FieldStateProps<Id> = {
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
} & Omit<Options, 'defaultChecked' | 'onChange'>;

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

const createFormControl = <Id extends string>(
  localizationUtils: ReturnType<typeof useLocalizations>,
  id: Id,
  initialState: string,
  opts?: Options,
) => {
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

  const control = new Store<ControlState<Id>>({
    ...options,
    id,
    name: id,
    value: applyTransformers(initialState, transformers),
    checked: options.defaultChecked || false,
    validatePassword: (options.type === 'password' ? options.validatePassword : undefined) as undefined,
    feedback: localizationUtils.t(options.infoText),
    feedbackType: 'info',
    hasPassedComplexity: false,
    isFocused: false,
  });

  const onChange: FormControlState['onChange'] = event => {
    const { onChange, type } = control._g();
    const result = onChange?.(event);

    if (type === 'checkbox') {
      return control._s({ checked: event.target.checked });
    }

    control._s({ value: applyTransformers(result || event.target.value || '', transformers) });
  };

  const setValue: FormControlState['setValue'] = val => {
    control._s({ value: val || '' });
  };
  const setChecked: FormControlState['setChecked'] = checked => {
    control._s({ checked });
  };
  const setError: FormControlState['setError'] = error => {
    control._s({ feedback: localizationUtils.translateError(error), feedbackType: 'error' });
  };
  const setSuccess: FormControlState['setSuccess'] = message => {
    control._s({ feedback: message, feedbackType: 'success' });
  };

  const setWarning: FormControlState['setWarning'] = warning => {
    control._s({ feedback: localizationUtils.translateError(warning), feedbackType: 'warning' });
  };

  const setInfo: FormControlState['setInfo'] = info => {
    control._s({ feedback: info, feedbackType: 'warning' });
  };

  const clearFeedback: FormControlState['clearFeedback'] = () => {
    control._s({ feedback: localizationUtils.t(options.infoText), feedbackType: 'info' });
  };

  const onFocus: FormControlState['onFocus'] = () => {
    control._s({ isFocused: true });
  };

  const onBlur: FormControlState['onBlur'] = () => {
    control._s({ isFocused: false });
  };

  const setHasPassedComplexity: FormControlState['setHasPassedComplexity'] = b => {
    control._s({ hasPassedComplexity: b });
  };

  return {
    control,
    onChange,
    setValue,
    setChecked,
    setError,
    setSuccess,
    setWarning,
    setInfo,
    clearFeedback,
    onFocus,
    onBlur,
    setHasPassedComplexity,
  };
};

const init = <Id extends string>(...args: [string | undefined, ...Parameters<typeof createFormControl<Id>>]) => {
  const [storeKey, localization, id, initialState, opts] = args;
  const _control = createFormControl(localization, id, initialState, opts);
  const { control, ...mutators } = _control;

  if (storeKey) {
    allStores.get(storeKey)?._s({
      [id]: {
        ...control._g(),
        ...mutators,
      },
    });

    control._sub(newControl => {
      allStores.get(storeKey)?._s(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          ...newControl,
        },
      }));
    });
  }
  // TODO: remove on unmount

  return _control;
};

export const useFormControl = <Id extends string>(
  id: Id,
  initialState: string,
  opts?: Options,
  storeKey?: string,
): FormControlState<Id> => {
  const localization = useLocalizations();
  const fieldControl = useRef<ReturnType<typeof createFormControl<Id>>>();

  if (!fieldControl.current) {
    fieldControl.current = init(storeKey, localization, id, initialState, opts);
  }

  const { control, ...mutators } = fieldControl.current;

  const state = useSyncExternalStore(
    o => control._sub(o),
    () => control._g(),
  );

  const { defaultChecked, buildErrorMessage, ...sanitzedState } = state;

  const props = {
    ...sanitzedState,
    // ...mutators,
    setSuccess: mutators.setSuccess,
    setError: mutators.setError,
    onChange: mutators.onChange,
    onBlur: mutators.onBlur,
    onFocus: mutators.onFocus,
    setWarning: mutators.setWarning,
    setInfo: mutators.setInfo,
    clearFeedback: mutators.clearFeedback,
    setHasPassedComplexity: mutators.setHasPassedComplexity,
  };

  // const props = {
  //   id,
  //   name: id,
  //   value,
  //   checked,
  //   setSuccess,
  //   setError,
  //   onChange,
  //   onBlur,
  //   onFocus,
  //   setWarning,
  //   feedback: feedback.message || t(options.infoText),
  //   feedbackType: feedback.type,
  //   setInfo,
  //   clearFeedback,
  //   hasPassedComplexity,
  //   setHasPassedComplexity,
  //   validatePassword: options.type === 'password' ? options.validatePassword : undefined,
  //   isFocused,
  //   ...restOpts,
  // };

  // console.log('props', props);

  return {
    props,
    ...props,
    buildErrorMessage,
    setError: mutators.setError,
    setValue: mutators.setValue,
    setChecked: mutators.setChecked,
  };
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
