import type { OAuthStrategy } from '@clerk/types';
import { Platform } from 'react-native';

export type UseOAuthFlowParams = {
  strategy: OAuthStrategy;
  redirectUrl?: string;
  unsafeMetadata?: SignUpUnsafeMetadata;
};
export function useOAuth(_useOAuthParams: UseOAuthFlowParams) {
  if (Platform.OS === 'web') {
    throw new Error('OAuth flow is not supported in web');
  }
}
