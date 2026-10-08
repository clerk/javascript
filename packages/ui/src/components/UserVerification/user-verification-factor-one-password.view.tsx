import React from 'react';

import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';

import { Col, descriptors, Flow, localizationKeys } from '../../customizables';
import { HavingTrouble } from '../SignIn/HavingTrouble';
import type { useUserVerificationFactorOnePasswordController } from './user-verification-factor-one-password.controller';

export const UserVerificationFactorOnePasswordView = ({
  controller,
  onShowAlternativeMethodsClick,
}: {
  controller: ReturnType<typeof useUserVerificationFactorOnePasswordController>;
  onShowAlternativeMethodsClick: React.MouseEventHandler | undefined;
}): JSX.Element => {
  const { showHavingTrouble, toggleHavingTrouble, passwordControl, handlePasswordSubmit, error } = controller;
  if (showHavingTrouble) {
    return <HavingTrouble onBackLinkClick={toggleHavingTrouble} />;
  }

  return (
    <Flow.Part part='password'>
      <Card.Root>
        <Card.Content>
          <Header.Root>
            <Header.Title localizationKey={localizationKeys('reverification.password.title')} />
            <Header.Subtitle localizationKey={localizationKeys('reverification.password.subtitle')} />
          </Header.Root>
          <Card.Alert>{error}</Card.Alert>
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
                    ? 'reverification.password.actionLink'
                    : 'reverification.alternativeMethods.actionLink',
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
};
