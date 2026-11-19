import type { ClerkCall } from '../clerk/errors';

export type WaitlistField = 'emailAddress';

export interface WaitlistValues {
  emailAddress: string;
}

export type WaitlistStep = 'form' | 'joined';

export type WaitlistModel =
  | { status: 'loading' }
  | {
      status: 'ready';
      initialEmailAddress: string;
      renderBranding: boolean;
      onJoinWaitlist: (emailAddress: string) => ClerkCall;
      onSignIn: () => void;
      onRedirect?: () => void;
    };
