import React from 'react';

import { useCoreClerk, useCoreSignIn, useEnvironment, useSignInContext } from '../../ui/contexts';
import { useSupportEmail } from '../../ui/hooks/useSupportEmail';
import { useRouter } from '../../ui/router/RouteContext';
import { descriptors, Flex, Flow } from '../customizables';
import { Card, CardAlert, Footer, Form, Header, IdentityPreview } from '../elements';
import { useCardState } from '../elements/contexts';
import { handleError, useFormControl } from '../utils';

type SignInFactorOnePasswordProps = {
  onShowAlternativeMethodsClick: React.MouseEventHandler;
};

export const SignInFactorOnePasswordCard = (props: SignInFactorOnePasswordProps) => {
  const { onShowAlternativeMethodsClick } = props;
  const card = useCardState();
  const { displayConfig } = useEnvironment();
  const { setActive } = useCoreClerk();
  const signIn = useCoreSignIn();
  const { navigateAfterSignIn } = useSignInContext();
  const supportEmail = useSupportEmail();
  const passwordControl = useFormControl('password', '', { type: 'password', label: 'Password' });
  const { navigate } = useRouter();

  const goBack = () => {
    return navigate('../');
  };

  const handlePasswordSubmit: React.FormEventHandler = async e => {
    e.preventDefault();
    return signIn
      .attemptFirstFactor({ strategy: 'password', password: passwordControl.value })
      .then(res => {
        switch (res.status) {
          case 'complete':
            return setActive({ session: res.createdSessionId, beforeEmit: navigateAfterSignIn });
          case 'needs_second_factor':
            return navigate('../factor-two');
          default:
            return alert(
              `Response: ${res.status} not supported yet.\nFor more information contact us at ${supportEmail}`,
            );
        }
      })
      .catch(err => handleError(err, [passwordControl], card.setError));
  };

  return (
    <Flow.Part part='password'>
      <Card>
        <CardAlert>{card.error}</CardAlert>
        <Header.Root>
          <Header.BackLink onClick={goBack} />
          <Header.Title>Enter password</Header.Title>
          <Header.Subtitle>to continue to {displayConfig.applicationName}</Header.Subtitle>
        </Header.Root>
        <IdentityPreview
          identifier={signIn.identifier}
          avatarUrl={signIn.userData.profileImageUrl}
          onClick={goBack}
        />
        {/*TODO: extract main in its own component */}
        <Flex
          direction='col'
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <Form.Root onSubmit={handlePasswordSubmit}>
            <Form.ControlRow>
              <Form.Control
                {...passwordControl.props}
                autoFocus
                actionLabel='Forgot password'
                onActionClicked={onShowAlternativeMethodsClick}
              />
            </Form.ControlRow>
            <Form.SubmitButton>Continue</Form.SubmitButton>
          </Form.Root>
        </Flex>
        <Footer.Root>
          <Footer.Action>
            <Footer.ActionLink onClick={onShowAlternativeMethodsClick}>Try another method</Footer.ActionLink>
          </Footer.Action>
          <Footer.Links />
        </Footer.Root>
      </Card>
    </Flow.Part>
  );
};
