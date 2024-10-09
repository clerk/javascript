import type { SignInProps, SignUpProps } from '@clerk/types';
import type { ComponentType } from 'react';

export interface ComponentDefinition {
  type: 'component' | 'modal';
  load: () => Promise<{ default: ComponentType }>;
}

export type ClerkNewComponents = {
  SignIn: SignInProps;
  SignUp: SignUpProps;
};
