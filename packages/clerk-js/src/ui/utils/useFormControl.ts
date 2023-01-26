import type { ClerkAPIError } from '@clerk/types';
import type { HTMLInputTypeAttribute } from 'react';
import React from 'react';

import type { LocalizationKey } from '../localization';
import { useLocalizations } from '../localization';

type SelectOption = { value: string; label?: string };

type Options = {
  isRequired?: boolean;
  label: string | LocalizationKey;
  placeholder?: string | LocalizationKey;
  type?: HTMLInputTypeAttribute;
  options?: SelectOption[];
};

type FieldStateProps<Id> = {
  id: Id;
  name: Id;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  errorText: string | undefined;
} & Options;

export type FormControlState<Id = string> = FieldStateProps<Id> & {
  setError: (error: string | ClerkAPIError | undefined) => void;
  setValue: (val: string | undefined) => void;
  props: FieldStateProps<Id>;
};

export const useFormControl = <Id extends string>(
  id: Id,
  initialState: string,
  opts?: Options,
): FormControlState<Id> => {
  opts = opts || { type: 'text', label: '', isRequired: false, placeholder: '', options: [] };
  const { translateError } = useLocalizations();
  const [value, setValueInternal] = React.useState(initialState);
  const [errorText, setErrorText] = React.useState<string | undefined>(undefined);

  const onChange: FormControlState['onChange'] = event => setValueInternal(event.target.value || '');
  const setValue: FormControlState['setValue'] = val => setValueInternal(val || '');
  const setError: FormControlState['setError'] = error => setErrorText(translateError(error || undefined));

  const props = { id, name: id, value, errorText, onChange, ...opts };

  return { props, ...props, setError, setValue };
};

type FormControlStateLike = Pick<FormControlState, 'id' | 'value'>;

export const buildRequest = (fieldStates: Array<FormControlStateLike>): Record<string, any> => {
  const request: { [x: string]: any } = {};
  fieldStates.forEach(x => {
    request[x.id] = x.value;
  });
  return request;
};
