import type { SignInResource } from '@clerk/types';
import React from 'react';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { useCoreClerk, useCoreSignIn, useEnvironment, useSignInContext } from '../../contexts';
import { Col, descriptors, localizationKeys } from '../../customizables';
import { Card, CardAlert, Footer, Form, Header, useCardState } from '../../elements';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { handleError, useFormControl } from '../../utils';
import { isResetPasswordStrategy } from './utils';

type SignInFactorTwoBackupCodeCardProps = {
  onShowAlternativeMethodsClicked: React.MouseEventHandler;
};

export const SignInFactorTwoBackupCodeCard = (props: SignInFactorTwoBackupCodeCardProps) => {
  const { onShowAlternativeMethodsClicked } = props;
  const signIn = useCoreSignIn();
  const { displayConfig } = useEnvironment();
  const { navigateAfterSignIn } = useSignInContext();
  const { setActive } = useCoreClerk();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();
  const card = useCardState();
  const codeControl = useFormControl('code', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__backupCode'),
    isRequired: true,
  });

  const isResettingPassword = (resource: SignInResource) =>
    isResetPasswordStrategy(resource.firstFactorVerification?.strategy) &&
    resource.firstFactorVerification?.status === 'verified';

  const handleBackupCodeSubmit: React.FormEventHandler = e => {
    e.preventDefault();
    return signIn
      .attemptSecondFactor({ strategy: 'backup_code', code: codeControl.value })
      .then(res => {
        switch (res.status) {
          case 'complete':
            if (isResettingPassword(res) && res.createdSessionId) {
              const queryParams = new URLSearchParams();
              queryParams.set('createdSessionId', res.createdSessionId);
              return navigate(`../reset-password-success?${queryParams.toString()}`);
            }
            return setActive({ session: res.createdSessionId, beforeEmit: navigateAfterSignIn });
          default:
            return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
        }
      })
      .catch(err => handleError(err, [codeControl], card.setError));
  };

  return (
    <Card>
      <CardAlert>{card.error}</CardAlert>
      <Header.Root>
        <Header.Title localizationKey={localizationKeys('signIn.backupCodeMfa.title')} />
        <Header.Subtitle
          localizationKey={
            isResettingPassword(signIn)
              ? localizationKeys('signIn.forgotPassword.subtitle')
              : localizationKeys('signIn.backupCodeMfa.subtitle', {
                  applicationName: displayConfig.applicationName,
                })
          }
        />
      </Header.Root>
      <Col
        elementDescriptor={descriptors.main}
        gap={8}
      >
        <Form.Root onSubmit={handleBackupCodeSubmit}>
          <Form.ControlRow elementId={codeControl.id}>
            <Form.Control
              {...codeControl.props}
              autoFocus
              onActionClicked={onShowAlternativeMethodsClicked}
            />
          </Form.ControlRow>
          <Form.SubmitButton />
        </Form.Root>
      </Col>
      <Footer.Root>
        <Footer.Action elementId='alternativeMethods'>
          {onShowAlternativeMethodsClicked && (
            <Footer.ActionLink
              localizationKey={localizationKeys('footerActionLink__useAnotherMethod')}
              onClick={onShowAlternativeMethodsClicked}
            />
          )}
        </Footer.Action>
        <Footer.Links />
      </Footer.Root>
    </Card>
  );
};
