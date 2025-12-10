import type { SetActive, SignInResource, SignUpResource } from '@clerk/shared/types';

export type SignUpUnsafeMetadata = Record<string, unknown>;

export type StartGoogleAuthenticationFlowParams = {
  unsafeMetadata?: SignUpUnsafeMetadata;
};

export type StartGoogleAuthenticationFlowReturnType = {
  createdSessionId: string | null;
  setActive?: SetActive;
  signIn?: SignInResource;
  signUp?: SignUpResource;
};
