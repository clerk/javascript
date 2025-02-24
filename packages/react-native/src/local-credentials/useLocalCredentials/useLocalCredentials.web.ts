import type { LocalCredentialsReturn } from './shared';
import { LocalCredentialsInitValues } from './shared';

export const useLocalCredentials = (): LocalCredentialsReturn => {
  return LocalCredentialsInitValues;
};
