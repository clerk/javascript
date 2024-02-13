import type { ClerkElementsFieldError } from '~/internals/errors';

export type FieldDetails = {
  name?: string;
  value?: string | readonly string[] | number;
  errors?: ClerkElementsFieldError[];
};

export type FormFields = Map<string, FieldDetails>;
