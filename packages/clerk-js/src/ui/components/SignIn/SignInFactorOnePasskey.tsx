import type { ResetPasswordCodeFactor } from '@clerk/types';
import React from 'react';

import { useCoreSignIn } from '../../contexts';
import { descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import { Card, Form, Header, IdentityPreview, useCardState } from '../../elements';
import { useRouter } from '../../router/RouteContext';
import { HavingTrouble } from './HavingTrouble';
import { useHandleAuthenticateWithPasskey } from './shared';

type SignInFactorOnePasswordProps = {
  onShowAlternativeMethodsClick: React.MouseEventHandler | undefined;
  onFactorPrepare: (f: ResetPasswordCodeFactor) => void;
};

export const SignInFactorOnePasskey = (props: SignInFactorOnePasswordProps) => {
  const { onShowAlternativeMethodsClick } = props;
  const card = useCardState();
  const signIn = useCoreSignIn();
  const { navigate } = useRouter();
  const [showHavingTrouble, setShowHavingTrouble] = React.useState(false);
  const toggleHavingTrouble = React.useCallback(() => setShowHavingTrouble(s => !s), [setShowHavingTrouble]);
  const authenticateWithPasskey = useHandleAuthenticateWithPasskey();

  const goBack = () => {
    return navigate('../');
  };

  const handleSubmit: React.FormEventHandler = e => {
    e.preventDefault();
    return authenticateWithPasskey();
  };

  if (showHavingTrouble) {
    return <HavingTrouble onBackLinkClick={toggleHavingTrouble} />;
  }

  return (
    <Flow.Part part='password'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={'Use your passkey to confirm its really you'} />
            <Header.Subtitle localizationKey={'Your device will ask you for your fingerprint, face, or screen lock'} />
            <IdentityPreview
              identifier={signIn.identifier}
              avatarUrl={signIn.userData.imageUrl}
              onClick={goBack}
            />
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
            <Card.Action elementId={onShowAlternativeMethodsClick ? 'alternativeMethods' : 'havingTrouble'}>
              <Card.ActionLink
                localizationKey={localizationKeys(
                  onShowAlternativeMethodsClick ? 'signIn.password.actionLink' : 'signIn.alternativeMethods.actionLink',
                )}
                onClick={onShowAlternativeMethodsClick || toggleHavingTrouble}
              />
            </Card.Action>
          </Flex>
        </Card.Content>

        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
};
