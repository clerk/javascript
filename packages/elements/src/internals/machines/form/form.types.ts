import type { ClerkElementsFieldError, ClerkElementsFieldWarning } from '~/internals/errors';

export type FormDefaultValues = Map<string, FieldDetails['value']>;

export type FieldDetails = {
  name?: string;
  value?: string | readonly string[] | number;
  errors?: ClerkElementsFieldError[];
  warnings?: ClerkElementsFieldWarning[];
};

export type FormFields = Map<string, FieldDetails>;
