import type React from 'react';

import type { FormControlState } from '@/ui/utils/useFormControl';

export type InstantPasswordRowProps = {
  field?: FormControlState<'password'>;
  onForgotPasswordClick?: React.MouseEventHandler;
};
