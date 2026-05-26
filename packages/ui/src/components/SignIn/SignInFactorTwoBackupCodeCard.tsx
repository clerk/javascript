import type { SignInResource } from '@clerk/shared/types';
import React from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useCoreSignIn } from '../../contexts';
import { Col, descriptors, localizationKeys } from '../../customizables';
import { useHandleSecondFactorResult, useHandleUserLockedError } from './useHandleAttemptResult';
import { isResetPasswordStrategy } from './utils';

type SignInFactorTwoBackupCodeCardProps = {
  onShowAlternativeMethodsClicked: React.MouseEventHandler;
};

export const SignInFactorTwoBackupCodeCard = (props: SignInFactorTwoBackupCodeCardProps) => {
  const { onShowAlternativeMethodsClicked } = props;
  const signIn = useCoreSignIn();
  const card = useCardState();
  const codeControl = useFormControl('code', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__backupCode'),
    isRequired: true,
  });
  const handleSecondFactorResult = useHandleSecondFactorResult();
  const handleUserLockedError = useHandleUserLockedError();

  const isResettingPassword = (resource: SignInResource) =>
    isResetPasswordStrategy(resource.firstFactorVerification?.strategy) &&
    resource.firstFactorVerification?.status === 'verified';

  const handleBackupCodeSubmit: React.FormEventHandler = e => {
    e.preventDefault();
    return signIn
      .attemptSecondFactor({ strategy: 'backup_code', code: codeControl.value })
      .then(handleSecondFactorResult)
      .catch(err => {
        if (handleUserLockedError(err)) {
          return;
        }
        handleError(err, [codeControl], card.setError);
      });
  };

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          <Header.Title localizationKey={localizationKeys('signIn.backupCodeMfa.title')} />
          <Header.Subtitle
            localizationKey={
              isResettingPassword(signIn)
                ? localizationKeys('signIn.forgotPassword.subtitle')
                : localizationKeys('signIn.backupCodeMfa.subtitle')
            }
          />
        </Header.Root>
        <Card.Alert>{card.error}</Card.Alert>
        <Col
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <Form.Root onSubmit={handleBackupCodeSubmit}>
            <Form.ControlRow elementId={codeControl.id}>
              <Form.PlainInput
                {...codeControl.props}
                autoFocus
                onActionClicked={onShowAlternativeMethodsClicked}
              />
            </Form.ControlRow>
            <Col gap={3}>
              <Form.SubmitButton hasArrow />
              <Card.Action elementId='alternativeMethods'>
                {onShowAlternativeMethodsClicked && (
                  <Card.ActionLink
                    localizationKey={localizationKeys('footerActionLink__useAnotherMethod')}
                    onClick={onShowAlternativeMethodsClicked}
                  />
                )}
              </Card.Action>
            </Col>
          </Form.Root>
        </Col>
      </Card.Content>

      <Card.Footer />
    </Card.Root>
  );
};
