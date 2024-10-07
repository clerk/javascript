'use client';

import { __experimental_protectComponent as protectComponentReact } from '@clerk/clerk-react';

import { UserVerificationModal, UserVerificationTrigger } from '../complementary-components';

export {
  ClerkLoaded,
  ClerkLoading,
  SignedOut,
  SignedIn,
  Protect,
  RedirectToSignIn,
  RedirectToSignUp,
  RedirectToUserProfile,
  AuthenticateWithRedirectCallback,
  RedirectToCreateOrganization,
  RedirectToOrganizationProfile,
} from '@clerk/clerk-react';

export { MultisessionAppSupport } from '@clerk/clerk-react/internal';

const __experimental_protectComponent: typeof protectComponentReact = args =>
  protectComponentReact({
    ...args,
    // @ts-ignore
    __internalModalComponent: UserVerificationModal,
    // @ts-ignore
    __internalTriggerComponent: UserVerificationTrigger,
  });

export { __experimental_protectComponent };
