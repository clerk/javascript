import { useClerk, useUser } from '@clerk/shared/react';
import React from 'react';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { useUserVerification } from '../../contexts';
import { Col, descriptors, localizationKeys } from '../../customizables';
import { Card, Form, Header, useCardState } from '../../elements';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { handleError, useFormControl } from '../../utils';

type UVFactorTwoBackupCodeCardProps = {
  onShowAlternativeMethodsClicked: React.MouseEventHandler;
};

export const UVFactorTwoBackupCodeCard = (props: UVFactorTwoBackupCodeCardProps) => {
  const { onShowAlternativeMethodsClicked } = props;
  const { user } = useUser();
  const { afterVerification, routing, afterVerificationUrl } = useUserVerification();
  const { setActive, closeUserVerification } = useClerk();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();
  const card = useCardState();
  const codeControl = useFormControl('code', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__backupCode'),
    isRequired: true,
  });

  const beforeEmit = async () => {
    if (routing === 'virtual') {
      /**
       * if `afterVerificationUrl` and modal redirect there,
       * else if `afterVerificationUrl` redirect there,
       * else If modal close it,
       */
      afterVerification?.();
      closeUserVerification();
    } else {
      if (afterVerificationUrl) {
        await navigate(afterVerificationUrl);
      }
    }
  };

  const handleBackupCodeSubmit: React.FormEventHandler = e => {
    e.preventDefault();
    return user!
      .verifySessionAttemptSecondFactor({ strategy: 'backup_code', code: codeControl.value })
      .then(res => {
        switch (res.status) {
          case 'complete':
            return setActive({ session: res.session.id, beforeEmit });
          default:
            return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
        }
      })
      .catch(err => handleError(err, [codeControl], card.setError));
  };

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          <Header.Title localizationKey={localizationKeys('signIn.backupCodeMfa.title')} />
          <Header.Subtitle localizationKey={localizationKeys('signIn.backupCodeMfa.subtitle')} />
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
