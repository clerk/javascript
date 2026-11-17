'use client';

import type { ReactElement, ReactNode } from 'react';

import { useSignUpController } from './sign-up.controller';
import { useSignUpModel } from './sign-up.model';
import { SignUpView } from './sign-up.view';

export interface SignUpProps {
  path?: string;
  fallback?: ReactNode;
}

export function SignUp({ path = '/sign-up', fallback = null }: SignUpProps): ReactElement | null {
  const model = useSignUpModel();
  const controller = useSignUpController(model, { routing: 'virtual', path });

  if (model.status === 'loading' || controller.status === 'loading') {
    return <>{fallback}</>;
  }

  const { status: _status, screen: _screen, ...viewProps } = controller;

  return (
    <SignUpView
      {...viewProps}
      applicationName={model.applicationName}
      applicationLogoUrl={model.applicationLogoUrl}
    />
  );
}
