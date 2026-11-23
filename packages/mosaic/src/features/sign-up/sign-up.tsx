'use client';

import type { SignUpInitialValues } from '@clerk/shared/types';
import type { ReactElement, ReactNode } from 'react';

import type { MosaicLocationOptions, RoutingProps } from '../../routing/use-mosaic-location';
import {
  isTaskChooseOrganizationReady,
  TaskChooseOrganizationContent,
} from '../task-choose-organization/task-choose-organization';
import { useTaskChooseOrganizationModel } from '../task-choose-organization/task-choose-organization.model';
import { useSignUpController } from './sign-up.controller';
import type { SignUpReadyModel } from './sign-up.model';
import { useSignUpModel } from './sign-up.model';
import { SignUpView } from './sign-up.view';
import { SignUpVerify } from './sign-up-verify/sign-up-verify';

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
  const task = useTaskChooseOrganizationModel({
    redirectUrlComplete: model.flow.afterSignUpUrl,
    enabled: model.flow.step.type === 'task',
  });
  const { attempt, verifyEmail, verifyPhone, ...view } = useSignUpController(model, {
    routing,
    path,
    isTaskReady: isTaskChooseOrganizationReady(task),
  });

  return (
    <SignUpView
      {...view}
      verifyEmail={
        <SignUpVerify
          key={attempt}
          channel='email'
          {...verifyEmail}
        />
      }
      verifyPhone={
        <SignUpVerify
          key={attempt}
          channel='phone'
          {...verifyPhone}
        />
      }
      applicationName={model.app.applicationName}
      applicationLogoUrl={model.app.applicationLogoUrl}
      taskChooseOrganization={<TaskChooseOrganizationContent model={task} />}
    />
  );
}
