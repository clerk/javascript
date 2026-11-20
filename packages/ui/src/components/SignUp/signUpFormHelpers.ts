import type { FieldKey } from '@clerk/shared/internal/clerk-js/signUpFormFields';

import type { FieldState } from '../../common';

export * from '@clerk/shared/internal/clerk-js/signUpFormFields';

export type FormState<T> = {
  [key in FieldKey]: FieldState<T>;
};
