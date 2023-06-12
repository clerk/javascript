'use client';

export {
  useUser,
  useAuth,
  useSession,
  useClerk,
  useSignIn,
  useSignUp,
  useSessionList,
  useOrganization,
  useOrganizationList,
  useOrganizations,
  useMagicLink,
  withUser,
  withSession,
  withClerk,
  WithUser,
  WithSession,
  WithClerk,
} from '@clerk/clerk-react';

export type { WithUserProp, WithSessionProp, WithClerkProp } from '@clerk/clerk-react';

export {
  isClerkAPIResponseError,
  MagicLinkErrorCode,
  isKnownError,
  isMetamaskError,
  isMagicLinkError,
} from '@clerk/clerk-react';
