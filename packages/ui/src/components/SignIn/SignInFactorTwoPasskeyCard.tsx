import React from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';

import { descriptors, Flex, localizationKeys } from '../../customizables';
import { useHandleAuthenticateWithPasskey } from './shared';

type SignInFactorTwoPasskeyCardProps = {
  onShowAlternativeMethodsClicked: React.MouseEventHandler;
};

export const SignInFactorTwoPasskeyCard = (props: SignInFactorTwoPasskeyCardProps) => {
  const { onShowAlternativeMethodsClicked } = props;
  const card = useCardState();
  // A successful attempt completes the sign-in, which the hook handles via
  // setActive; the sign-in can't come back as needs_second_factor.
  const authenticateWithPasskey = useHandleAuthenticateWithPasskey(() => Promise.resolve());

  const handleSubmit: React.FormEventHandler = e => {
    e.preventDefault();
    return authenticateWithPasskey();
  };

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          <Header.Title localizationKey={localizationKeys('signIn.passkeyMfa.title')} />
          <Header.Subtitle localizationKey={localizationKeys('signIn.passkeyMfa.subtitle')} />
        </Header.Root>
        <Card.Alert>{card.error}</Card.Alert>
        <Flex
          direction='col'
          elementDescriptor={descriptors.main}
          gap={4}
        >
          <Form.Root
            onSubmit={handleSubmit}
            gap={8}
          >
            <Form.SubmitButton hasArrow />
          </Form.Root>
          <Card.Action elementId='alternativeMethods'>
            <Card.ActionLink
              localizationKey={localizationKeys('footerActionLink__useAnotherMethod')}
              onClick={onShowAlternativeMethodsClicked}
            />
          </Card.Action>
        </Flex>
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
};
