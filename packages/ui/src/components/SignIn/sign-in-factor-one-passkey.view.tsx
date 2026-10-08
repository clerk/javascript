import type React from 'react';

import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { IdentityPreview } from '@/ui/elements/IdentityPreview';

import { descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import { HavingTrouble } from './HavingTrouble';

export type SignInFactorOnePasskeyViewProps = {
  identifier: string | null;
  avatarUrl: string | undefined;
  error: React.ReactNode;
  goBack: () => void | Promise<unknown>;
  showHavingTrouble: boolean;
  toggleHavingTrouble: () => void;
  handleSubmit: React.FormEventHandler;
  onShowAlternativeMethodsClick: React.MouseEventHandler | undefined;
};

export function SignInFactorOnePasskeyView(props: SignInFactorOnePasskeyViewProps) {
  if (props.showHavingTrouble) {
    return <HavingTrouble onBackLinkClick={props.toggleHavingTrouble} />;
  }

  return (
    <Flow.Part part='password'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={localizationKeys('signIn.passkey.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signIn.passkey.subtitle')} />
            <IdentityPreview
              identifier={props.identifier}
              avatarUrl={props.avatarUrl}
              onClick={props.goBack}
              editButtonAriaLabel={localizationKeys('identityPreviewEditButton__identifier')}
            />
          </Header.Root>
          <Card.Alert>{props.error}</Card.Alert>
          <Flex
            direction='col'
            elementDescriptor={descriptors.main}
            gap={4}
          >
            <Form.Root
              onSubmit={props.handleSubmit}
              gap={8}
            >
              <Form.SubmitButton hasArrow />
            </Form.Root>
            <Card.Action elementId={props.onShowAlternativeMethodsClick ? 'alternativeMethods' : 'havingTrouble'}>
              <Card.ActionLink
                localizationKey={localizationKeys(
                  props.onShowAlternativeMethodsClick
                    ? 'footerActionLink__useAnotherMethod'
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
