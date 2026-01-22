import { isUserLockedError } from '@clerk/shared/error';
import { clerkInvalidFAPIResponse } from '@clerk/shared/internal/clerk-js/errors';
import { useClerk } from '@clerk/shared/react';
import type { SignInResource } from '@clerk/shared/types';
import React from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useCoreSignIn, useSignInContext } from '../../contexts';
import { Col, descriptors, localizationKeys } from '../../customizables';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { isResetPasswordStrategy } from './utils';

type SignInFactorTwoBackupCodeCardProps = {
  onShowAlternativeMethodsClicked: React.MouseEventHandler;
};

export const SignInFactorTwoBackupCodeCard = (props: SignInFactorTwoBackupCodeCardProps) => {
  const { onShowAlternativeMethodsClicked } = props;
  const signIn = useCoreSignIn();
  const { afterSignInUrl, navigateOnSetActive } = useSignInContext();
  const { setSelected } = useClerk();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();
  const card = useCardState();
  const codeControl = useFormControl('code', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__backupCode'),
    isRequired: true,
  });
  const clerk = useClerk();

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
            return setSelected({
              session: res.createdSessionId,
              navigate: async ({ session }) => {
                await navigateOnSetActive({ session, redirectUrl: afterSignInUrl });
              },
            });
          default:
            return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
        }
      })
      .catch(err => {
        if (isUserLockedError(err)) {
          // @ts-expect-error -- private method for the time being
          return clerk.__internal_navigateWithError('..', err.errors[0]);
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
