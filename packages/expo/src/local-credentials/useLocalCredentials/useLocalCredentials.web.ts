import { deprecated } from '@clerk/shared/deprecated';

import type { LocalCredentialsReturn } from './shared';
import { LocalCredentialsInitValues } from './shared';

export const useLocalCredentials = (): LocalCredentialsReturn => {
  deprecated(
    'useLocalCredentials',
    'Build this flow with `expo-secure-store` instead. See https://clerk.com/docs/guides/development/local-credentials',
  );
  return LocalCredentialsInitValues;
};
