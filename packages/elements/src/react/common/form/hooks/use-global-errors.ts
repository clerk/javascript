import { globalErrorsSelector, useFormSelector } from '~/internals/machines/form';

export function useGlobalErrors() {
  const errors = useFormSelector(globalErrorsSelector);

  return {
    errors,
  };
}
