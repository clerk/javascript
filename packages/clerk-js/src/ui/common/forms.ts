import React from 'react';

export interface FieldState<T> {
  name: string;
  required?: boolean;
  value: T;
  setValue: React.Dispatch<React.SetStateAction<T>>;
  error: string | undefined;
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export const buildRequest = (fieldStates: Array<FieldState<string>>): Record<string, any> => {
  const request: { [x: string]: any } = {};
  fieldStates.forEach(x => {
    request[x.name] = x.value;
  });
  return request;
};

export const useFieldState = <T>(name: string, initialState: T): FieldState<T> => {
  const [value, setValue] = React.useState<T>(initialState);
  const [error, setError] = React.useState<string | undefined>(undefined);

  return {
    name,
    value,
    setValue,
    error,
    setError,
  };
};

// TODO: Replace origin useFieldState with this one
export const useFieldStateV2 = <T>(name: string, required: boolean, initialState: T): FieldState<T> => {
  const [value, setValue] = React.useState<T>(initialState);
  const [error, setError] = React.useState<string | undefined>(undefined);

  return {
    name,
    required,
    value,
    setValue,
    error,
    setError,
  };
};
