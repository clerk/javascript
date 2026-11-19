'use client';

import type { SignUpInitialValues } from '@clerk/shared/types';
import type { ReactElement, ReactNode } from 'react';

import type { MosaicLocationOptions, RoutingProps } from '../../routing/use-mosaic-location';
import { TaskChooseOrganizationContent } from '../task-choose-organization/task-choose-organization';
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

// TODO: Explore a separate routing table for the combined sign-in and sign-up flow.
function SignUpFlow({
  model,
  routing,
  path,
}: Required<MosaicLocationOptions> & { model: SignUpReadyModel }): ReactElement {
  const view = useSignUpController(model, { routing, path });

  return (
    <SignUpView
      {...view}
      applicationName={model.app.applicationName}
      applicationLogoUrl={model.app.applicationLogoUrl}
      taskChooseOrganization={<TaskChooseOrganizationContent redirectUrlComplete={model.flow.afterSignUpUrl} />}
    />
  );
}
