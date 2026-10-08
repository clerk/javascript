import type React from 'react';

import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { IdentityPreview } from '@/ui/elements/IdentityPreview';

import { descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import { HavingTrouble } from './HavingTrouble';
import type { useSignInFactorOnePasswordController } from './sign-in-factor-one-password.controller';

type PasswordController = ReturnType<typeof useSignInFactorOnePasswordController>;

export type SignInFactorOnePasswordViewProps = PasswordController & {
  onShowAlternativeMethodsClick: React.MouseEventHandler | undefined;
};

export function SignInFactorOnePasswordView(props: SignInFactorOnePasswordViewProps) {
  if (props.showHavingTrouble) {
    return <HavingTrouble onBackLinkClick={props.toggleHavingTrouble} />;
  }

  return (
    <Flow.Part part='password'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={localizationKeys('signIn.password.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signIn.password.subtitle')} />
            <IdentityPreview
              identifier={props.identifier}
              avatarUrl={props.avatarUrl}
              onClick={props.goBack}
              editButtonAriaLabel={localizationKeys('identityPreviewEditButton__identifier')}
            />
          </Header.Root>
          <Card.Alert>{props.error}</Card.Alert>
          {/*TODO: extract main in its own component */}
          <Flex
            direction='col'
            elementDescriptor={descriptors.main}
            gap={4}
          >
            <Form.Root
              onSubmit={props.handleSubmit}
              gap={8}
            >
              {/* For password managers */}
              <input
                readOnly
                id='identifier-field'
                name='identifier'
                value={props.identifier || ''}
                style={{ display: 'none' }}
              />
              <Form.ControlRow elementId={props.passwordControl.id}>
                <Form.PasswordInput
                  {...props.passwordControl.props}
                  ref={props.passwordInputRef}
                  autoFocus
                />
              </Form.ControlRow>
              <Form.SubmitButton hasArrow />
            </Form.Root>
            <Card.Action elementId={props.onShowAlternativeMethodsClick ? 'alternativeMethods' : 'havingTrouble'}>
              <Card.ActionLink
                localizationKey={localizationKeys(
                  props.onShowAlternativeMethodsClick
                    ? 'signIn.password.actionLink'
                    : 'signIn.alternativeMethods.actionLink',
                )}
                onClick={props.onShowAlternativeMethodsClick || props.toggleHavingTrouble}
              />
            </Card.Action>
          </Flex>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
}
