import { useSession } from '@clerk/shared/react';
import React from 'react';

import { Col, descriptors, localizationKeys } from '../../customizables';
import { Card, Form, Header, useCardState } from '../../elements';
import { handleError, useFormControl } from '../../utils';
import { useAfterVerification } from './use-after-verification';

type UVFactorTwoBackupCodeCardProps = {
  onShowAlternativeMethodsClicked: React.MouseEventHandler;
};

export const UVFactorTwoBackupCodeCard = (props: UVFactorTwoBackupCodeCardProps) => {
  const { onShowAlternativeMethodsClicked } = props;
  const { session } = useSession();
  const { handleVerificationResponse } = useAfterVerification();

  const card = useCardState();
  const codeControl = useFormControl('code', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__backupCode'),
    isRequired: true,
  });

  const handleBackupCodeSubmit: React.FormEventHandler = e => {
    e.preventDefault();
    return session!
      .__experimental_attemptSecondFactorVerification({ strategy: 'backup_code', code: codeControl.value })
      .then(handleVerificationResponse)
      .catch(err => handleError(err, [codeControl], card.setError));
  };

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          <Header.Title localizationKey={localizationKeys('__experimental_userVerification.backupCodeMfa.title')} />
          <Header.Subtitle
            localizationKey={localizationKeys('__experimental_userVerification.backupCodeMfa.subtitle')}
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
