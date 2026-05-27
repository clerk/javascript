import React from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { IdentityPreview } from '@/ui/elements/IdentityPreview';

import { descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import { HavingTrouble } from './HavingTrouble';

type SignInFactorOnePasskeyProps = {
  onShowAlternativeMethodsClick: React.MouseEventHandler | undefined;
  onFactorPrepare: () => void;
  authenticateWithPasskey: () => Promise<void>;
  onGoBack: () => void;
  identifier: string | null;
  avatarUrl: string | undefined;
};

export const SignInFactorOnePasskey = (props: SignInFactorOnePasskeyProps) => {
  const { onShowAlternativeMethodsClick, authenticateWithPasskey, onGoBack, identifier, avatarUrl } = props;
  const card = useCardState();
  const [showHavingTrouble, setShowHavingTrouble] = React.useState(false);
  const toggleHavingTrouble = React.useCallback(() => setShowHavingTrouble(s => !s), [setShowHavingTrouble]);

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
            <Header.Title localizationKey={localizationKeys('signIn.passkey.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signIn.passkey.subtitle')} />
            <IdentityPreview
              identifier={identifier}
              avatarUrl={avatarUrl}
              onClick={onGoBack}
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
                  onShowAlternativeMethodsClick
                    ? 'footerActionLink__useAnotherMethod'
                    : 'signIn.alternativeMethods.actionLink',
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
