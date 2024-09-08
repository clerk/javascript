import { useSession } from '@clerk/shared/react';
import React from 'react';

import { Col, descriptors, Flow, localizationKeys } from '../../customizables';
import { Card, Form, Header, useCardState } from '../../elements';
import { handleError, useFormControl } from '../../utils';
import { HavingTrouble } from '../SignIn/HavingTrouble';
import { useAfterVerification } from './use-after-verification';

type UserVerificationFactorOnePasswordProps = {
  onShowAlternativeMethodsClick: React.MouseEventHandler | undefined;
};

export function UserVerificationFactorOnePasswordCard(props: UserVerificationFactorOnePasswordProps): JSX.Element {
  const { onShowAlternativeMethodsClick } = props;
  const { session } = useSession();

  const { handleVerificationResponse } = useAfterVerification();
  const card = useCardState();

  const [showHavingTrouble, setShowHavingTrouble] = React.useState(false);
  const toggleHavingTrouble = React.useCallback(() => setShowHavingTrouble(s => !s), [setShowHavingTrouble]);

  const passwordControl = useFormControl('password', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__password'),
    placeholder: localizationKeys('formFieldInputPlaceholder__password'),
  });

  const handlePasswordSubmit: React.FormEventHandler = async e => {
    e.preventDefault();
    return session
      ?.__experimental_attemptFirstFactorVerification({
        strategy: 'password',
        password: passwordControl.value,
      })
      .then(handleVerificationResponse)
      .catch(err => handleError(err, [passwordControl], card.setError));
  };

  if (showHavingTrouble) {
    return <HavingTrouble onBackLinkClick={toggleHavingTrouble} />;
  }

  return (
    <Flow.Part part='password'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={localizationKeys('__experimental_userVerification.password.title')} />
            <Header.Subtitle localizationKey={localizationKeys('__experimental_userVerification.password.subtitle')} />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          <Col
            elementDescriptor={descriptors.main}
            gap={4}
          >
            <Form.Root
              onSubmit={handlePasswordSubmit}
              gap={8}
            >
              {/* For password managers */}
              {/*<input*/}
              {/*  readOnly*/}
              {/*  id='identifier-field'*/}
              {/*  name='identifier'*/}
              {/*  value={signIn.identifier || ''}*/}
              {/*  style={{ display: 'none' }}*/}
              {/*/>*/}

              <Form.ControlRow elementId={passwordControl.id}>
                <Form.PasswordInput
                  {...passwordControl.props}
                  autoFocus
                />
              </Form.ControlRow>
              <Form.SubmitButton hasArrow />
            </Form.Root>
            <Card.Action elementId={onShowAlternativeMethodsClick ? 'alternativeMethods' : 'havingTrouble'}>
              <Card.ActionLink
                localizationKey={localizationKeys(
                  onShowAlternativeMethodsClick
                    ? '__experimental_userVerification.password.actionLink'
                    : '__experimental_userVerification.alternativeMethods.actionLink',
                )}
                onClick={onShowAlternativeMethodsClick || toggleHavingTrouble}
              />
            </Card.Action>
          </Col>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
}
