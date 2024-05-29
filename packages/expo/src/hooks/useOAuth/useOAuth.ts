import type { OAuthStrategy } from '@clerk/types';
import { Platform } from 'react-native';

import { errorThrower } from '../../utils/errors';

export type UseOAuthFlowParams = {
  strategy: OAuthStrategy;
  redirectUrl?: string;
  unsafeMetadata?: SignUpUnsafeMetadata;
};
export function useOAuth(_useOAuthParams: UseOAuthFlowParams) {
  if (Platform.OS === 'web') {
    throw errorThrower.throw('useOAuth hook is not supported in Web');
  }
}
