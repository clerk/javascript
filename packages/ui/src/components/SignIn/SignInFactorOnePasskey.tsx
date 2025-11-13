import type { ResetPasswordCodeFactor } from '@clerk/shared/types';
import React from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { IdentityPreview } from '@/ui/elements/IdentityPreview';

import { useCoreSignIn } from '../../contexts';
import { descriptors, Flex, Flow, Icon, localizationKeys } from '../../customizables';
import { Fingerprint } from '../../icons';
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
  const onSecondFactor = () => navigate('../factor-two');
  const authenticateWithPasskey = useHandleAuthenticateWithPasskey(onSecondFactor);

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
            <Icon
              elementDescriptor={descriptors.passkeyIcon}
              icon={Fingerprint}
              sx={t => ({
                color: t.colors.$neutralAlpha500,
                marginInline: 'auto',
                paddingBottom: t.sizes.$1,
                width: t.sizes.$12,
                height: t.sizes.$12,
              })}
            />
            <Header.Title localizationKey={localizationKeys('signIn.passkey.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signIn.passkey.subtitle')} />
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
