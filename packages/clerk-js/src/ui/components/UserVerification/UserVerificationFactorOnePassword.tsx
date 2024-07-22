import { useClerk, useSession, useUser } from '@clerk/shared/react';
import React from 'react';

import { Col, descriptors, Flow, localizationKeys } from '../../customizables';
import { Card, Form, Header, useCardState } from '../../elements';
import { handleError, useFormControl } from '../../utils';

export function UserVerificationFactorOnePasswordCard(): JSX.Element {
  const { user } = useUser();
  const card = useCardState();
  const { session } = useSession();
  const { setActive } = useClerk();

  const passwordControl = useFormControl('password', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__password'),
    placeholder: localizationKeys('formFieldInputPlaceholder__password'),
  });

  const handlePasswordSubmit: React.FormEventHandler = async e => {
    e.preventDefault();
    return user
      ?.verifySessionAttemptFirstFactor({
        password: passwordControl.value,
      })
      .then(async () => {
        await session?.getToken({ skipCache: true });
        await setActive({ session: session?.id });
        //   switch (res.status) {
        //     case 'complete':
        //       return setActive({ session: res.createdSessionId, beforeEmit: navigateAfterSignIn });
        //     case 'needs_second_factor':
        //       return navigate('../factor-two');
        //     default:
        //       return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
        //   }
      })
      .catch(err => handleError(err, [passwordControl], card.setError));
  };

  return (
    <Flow.Part part='start'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title>Verification required</Header.Title>
            <Header.Subtitle>
              In order to make changes, please verify it’s really you by entering the password.
            </Header.Subtitle>
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
            <Card.Action elementId={'alternativeMethods'}>
              <Card.ActionLink
                localizationKey={localizationKeys('signIn.password.actionLink')}
                // onClick={onShowAlternativeMethodsClick || toggleHavingTrouble}
              />
            </Card.Action>
          </Col>
        </Card.Content>
        <Card.Footer>
          {/*<Card.Action elementId='signIn'>*/}
          {/*  <Card.ActionText localizationKey={localizationKeys('signIn.start.actionText')} />*/}
          {/*  <Card.ActionLink*/}
          {/*    localizationKey={localizationKeys('signIn.start.actionLink')}*/}
          {/*    to={clerk.buildUrlWithAuth(signUpUrl)}*/}
          {/*  />*/}
          {/*</Card.Action>*/}
        </Card.Footer>
      </Card.Root>
    </Flow.Part>
  );
}
