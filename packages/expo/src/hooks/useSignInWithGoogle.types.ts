import type { SetSelected, SignInResource, SignUpResource } from '@clerk/shared/types';

export type StartGoogleAuthenticationFlowParams = {
  unsafeMetadata?: SignUpUnsafeMetadata;
};

export type StartGoogleAuthenticationFlowReturnType = {
  createdSessionId: string | null;
  setSelected?: SetSelected;
  signIn?: SignInResource;
  signUp?: SignUpResource;
};
