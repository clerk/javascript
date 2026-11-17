'use client';

import type { SignUpInitialValues } from '@clerk/shared/types';
import type { ReactElement, ReactNode } from 'react';

import { useSignUpController } from './sign-up.controller';
import type { SignUpReadyModel } from './sign-up.model';
import { useSignUpModel } from './sign-up.model';
import { SignUpView } from './sign-up.view';

export interface SignUpProps {
  path?: string;
  fallback?: ReactNode;
  initialValues?: SignUpInitialValues;
  unsafeMetadata?: SignUpUnsafeMetadata;
  /**
   * Shows the fields the instance marks as optional, each with an "Optional" hint. When `false`, only required
   * fields appear, plus the email or phone field when the user can sign up with either.
   *
   * @default false
   */
  showOptionalFields?: boolean;
}

export function SignUp({
  path = '/sign-up',
  fallback = null,
  initialValues,
  unsafeMetadata,
  showOptionalFields,
}: SignUpProps): ReactElement | null {
  const model = useSignUpModel({ initialValues, unsafeMetadata, showOptionalFields });

  if (model.status === 'loading') {
    return <>{fallback}</>;
  }

  return (
    <SignUpFlow
      model={model}
      path={path}
    />
  );
}

function SignUpFlow({ model, path }: { model: SignUpReadyModel; path: string }): ReactElement {
  const { screen: _screen, ...viewProps } = useSignUpController(model, { routing: 'virtual', path });

  return (
    <SignUpView
      {...viewProps}
      applicationName={model.applicationName}
      applicationLogoUrl={model.applicationLogoUrl}
    />
  );
}
