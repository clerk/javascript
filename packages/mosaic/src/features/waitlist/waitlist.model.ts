import { useClerk } from '@clerk/shared/react';
import type { WaitlistProps } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { useMosaicRouter } from '../../hooks/use-mosaic-router';
import { save } from '../../utils/errors';
import type { WaitlistField, WaitlistModel } from './waitlist.types';

export type WaitlistModelOptions = Pick<WaitlistProps, 'afterJoinWaitlistUrl' | 'signInUrl'>;

const WAITLIST_FIELDS: readonly WaitlistField[] = ['emailAddress'];

export function useWaitlistModel(options: WaitlistModelOptions = {}): WaitlistModel {
  const clerk = useClerk();
  const environment = useMosaicEnvironment();
  const router = useMosaicRouter();

  if (!clerk.loaded || !environment) {
    return { status: 'loading' };
  }

  const { displayConfig } = environment;
  const signInUrl = options.signInUrl || clerk.__internal_getOption('signInUrl') || displayConfig.signInUrl;
  const { afterJoinWaitlistUrl } = options;

  return {
    status: 'ready',
    initialEmailAddress: router.getSearchParams().get('email_address') ?? '',
    renderBranding: displayConfig.branded,
    onJoinWaitlist: emailAddress => save(() => clerk.joinWaitlist({ emailAddress }), WAITLIST_FIELDS),
    onSignIn: () => void router.navigate(clerk.buildUrlWithAuth(signInUrl)),
    onRedirect: afterJoinWaitlistUrl ? () => void router.navigate(afterJoinWaitlistUrl) : undefined,
  };
}
