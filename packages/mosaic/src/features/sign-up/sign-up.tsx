'use client';

import type { SignUpInitialValues } from '@clerk/shared/types';
import type { ReactElement, ReactNode } from 'react';

import type { MosaicLocationOptions, RoutingProps } from '../../routing/use-mosaic-location';
import { useSignUpController } from './sign-up.controller';
import type { SignUpReadyModel } from './sign-up.model';
import { useSignUpModel } from './sign-up.model';
import { SignUpView } from './sign-up.view';

export interface SignUpProps extends RoutingProps {
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
  routing = 'virtual',
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
      routing={routing}
      path={path}
    />
  );
}

// TODO: The combined sign-in and sign-up flow holds these routes under `create/`. That needs the nested scopes
// from the routing work (#10780) before it can be built.
function SignUpFlow({
  model,
  routing,
  path,
}: Required<MosaicLocationOptions> & { model: SignUpReadyModel }): ReactElement {
  const { screen: _screen, ...viewProps } = useSignUpController(model, { routing, path });

  return (
    <SignUpView
      {...viewProps}
      applicationName={model.applicationName}
      applicationLogoUrl={model.applicationLogoUrl}
    />
  );
}
