import React from 'react';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { useCoreClerk, useCoreSignIn, useSignInContext } from '../../contexts';
import { descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import { Card, CardAlert, Footer, Form, Header, IdentityPreview, useCardState } from '../../elements';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router/RouteContext';
import { handleError, useFormControl } from '../../utils';

type SignInFactorOnePasswordProps = {
  onShowAlternativeMethodsClick: React.MouseEventHandler;
};

export const SignInFactorOnePasswordCard = (props: SignInFactorOnePasswordProps) => {
  const { onShowAlternativeMethodsClick } = props;
  const card = useCardState();
  const { setActive } = useCoreClerk();
  const signIn = useCoreSignIn();
  const { navigateAfterSignIn } = useSignInContext();
  const supportEmail = useSupportEmail();
  const passwordControl = useFormControl('password', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__password'),
  });
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
            return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
        }
      })
      .catch(err => handleError(err, [passwordControl], card.setError));
  };

  return (
    <Flow.Part part='password'>
      <Card>
        <CardAlert>{card.error}</CardAlert>
        <Header.Root>
          <Header.Title localizationKey={localizationKeys('signIn.password.title')} />
          <Header.Subtitle localizationKey={localizationKeys('signIn.password.subtitle')} />
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
                actionLabel={localizationKeys('formFieldAction__forgotPassword')}
                onActionClicked={onShowAlternativeMethodsClick}
              />
            </Form.ControlRow>
            <Form.SubmitButton />
          </Form.Root>
        </Flex>
        <Footer.Root>
          <Footer.Action elementId='alternative'>
            <Footer.ActionLink
              localizationKey={localizationKeys('signIn.password.actionLink')}
              onClick={onShowAlternativeMethodsClick}
            />
          </Footer.Action>
          <Footer.Links />
        </Footer.Root>
      </Card>
    </Flow.Part>
  );
};
