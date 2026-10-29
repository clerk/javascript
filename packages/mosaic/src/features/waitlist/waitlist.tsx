'use client';

import type { ReactElement, ReactNode } from 'react';

import type { WaitlistReadyModel } from './waitlist.controller';
import { useWaitlistController } from './waitlist.controller';
import type { WaitlistModelOptions } from './waitlist.model';
import { useWaitlistModel } from './waitlist.model';
import { WaitlistView } from './waitlist.view';

export interface WaitlistProps extends WaitlistModelOptions {
  /** Rendered while Clerk loads. */
  fallback?: ReactNode;
}

/**
 * A card that collects an email address and adds it to the application's waitlist, then thanks the
 * user. It reads the application from Clerk, so it takes no data. It renders `fallback` until Clerk
 * answers.
 *
 * An `email_address` query parameter fills in the field.
 *
 * @example
 * ```tsx
 * import { Waitlist } from '@clerk/mosaic';
 *
 * <Waitlist />
 * ```
 *
 * @example
 * `afterJoinWaitlistUrl` sends the user on two seconds after they join. `signInUrl` is where the
 * "Sign in" link goes, and defaults to the application's sign-in URL.
 * ```tsx
 * <Waitlist
 *   afterJoinWaitlistUrl='/thanks'
 *   signInUrl='/login'
 * />
 * ```
 */
export function Waitlist({ fallback, ...options }: WaitlistProps = {}): ReactElement {
  const model = useWaitlistModel(options);

  if (model.status === 'loading') {
    return <>{fallback}</>;
  }

  return <ReadyWaitlist model={model} />;
}

function ReadyWaitlist({ model }: { model: WaitlistReadyModel }) {
  const controller = useWaitlistController(model);
  return <WaitlistView {...controller} />;
}
