import type { ClerkElementsFieldError } from '../errors/error';

export type FieldDetails = {
  name?: string;
  value?: string | readonly string[] | number;
  errors?: ClerkElementsFieldError[];
};
