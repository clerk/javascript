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
      onJoinWaitlist: (emailAddress: string) => Promise<void>;
      onSignIn: () => void;
      onRedirect?: () => void;
    };
