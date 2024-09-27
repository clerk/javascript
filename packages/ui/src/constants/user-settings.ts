import type { SignUpModes } from '@clerk/types';

export const SIGN_UP_MODES: Record<string, SignUpModes> = {
  PUBLIC: 'public',
  RESTRICTED: 'restricted',
};
