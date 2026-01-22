import type { SelectSessionHook, SignInResource, SignUpResource } from '@clerk/shared/types';

export type StartGoogleAuthenticationFlowParams = {
  unsafeMetadata?: SignUpUnsafeMetadata;
};

export type StartGoogleAuthenticationFlowReturnType = {
  createdSessionId: string | null;
  selectSession?: SelectSessionHook;
  signIn?: SignInResource;
  signUp?: SignUpResource;
};
