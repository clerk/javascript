import React, { HTMLInputTypeAttribute } from 'react';

type Options = {
  label: string;
  type: HTMLInputTypeAttribute;
};

type FieldStateProps<Id> = {
  id: Id;
  name: Id;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  errorText: string | undefined;
} & Options;

export type FormControlState<Id = string> = FieldStateProps<Id> & {
  setError: (error: string | undefined) => void;
  props: FieldStateProps<Id>;
};

export const useFormControl = <Id extends string>(
  id: Id,
  initialState: string,
  opts?: Options,
): FormControlState<Id> => {
  opts = opts || { type: 'text', label: '' };
  const [value, setValue] = React.useState(initialState);
  const [errorText, setErrorText] = React.useState<string | undefined>(undefined);

  const onChange: FormControlState['onChange'] = event => setValue(event.target.value || '');
  const setError: FormControlState['setError'] = error => {
    console.log('setError called', error);
    setErrorText(error || undefined);
  };

  const props = { id, name: id, value, errorText, onChange, ...opts };

  return { props, ...props, setError };
};

export const buildRequest = (fieldStates: Array<FormControlState<string>>): Record<string, any> => {
  const request: { [x: string]: any } = {};
  fieldStates.forEach(x => {
    request[x.id] = x.value;
  });
  return request;
};
