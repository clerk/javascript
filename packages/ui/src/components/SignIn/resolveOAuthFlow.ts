import type { Clerk } from '@clerk/shared/types';

import { originPrefersPopup } from '@/ui/utils/originPrefersPopup';

type RequestedOAuthFlow = 'auto' | 'redirect' | 'popup';
export type EffectiveOAuthFlow = 'redirect' | 'popup' | 'transport';

export function resolveOAuthFlow({
  requestedFlow,
  clerk,
  prefersPopup = originPrefersPopup,
}: {
  requestedFlow?: RequestedOAuthFlow;
  clerk: Pick<Clerk, '__internal_hasOAuthTransport'>;
  prefersPopup?: () => boolean;
}): EffectiveOAuthFlow {
  const oauthFlow = requestedFlow || 'auto';

  if (clerk.__internal_hasOAuthTransport) {
    return 'transport';
  }

  if (oauthFlow === 'popup' || (oauthFlow === 'auto' && prefersPopup())) {
    return 'popup';
  }

  return 'redirect';
}
