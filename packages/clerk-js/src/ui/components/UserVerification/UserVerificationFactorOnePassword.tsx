import { useClerk, useSession, useUser } from '@clerk/shared/react';
import React from 'react';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { useUserVerification } from '../../contexts';
import { Col, descriptors, Flow, localizationKeys } from '../../customizables';
import { Card, Form, Header, useCardState } from '../../elements';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { handleError, useFormControl } from '../../utils';
import { HavingTrouble } from '../SignIn/HavingTrouble';

type UserVerificationFactorOnePasswordProps = {
  onShowAlternativeMethodsClick: React.MouseEventHandler | undefined;
};

export function UserVerificationFactorOnePasswordCard(props: UserVerificationFactorOnePasswordProps): JSX.Element {
  const { onShowAlternativeMethodsClick } = props;
  const { user } = useUser();
  const { afterVerification, routing, afterVerificationUrl } = useUserVerification();
  const { closeUserVerification } = useClerk();
  const card = useCardState();
  const supportEmail = useSupportEmail();
  const { session } = useSession();
  const { setActive } = useClerk();
  const { navigate } = useRouter();
  const [showHavingTrouble, setShowHavingTrouble] = React.useState(false);
  const toggleHavingTrouble = React.useCallback(() => setShowHavingTrouble(s => !s), [setShowHavingTrouble]);

  const passwordControl = useFormControl('password', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__password'),
    placeholder: localizationKeys('formFieldInputPlaceholder__password'),
  });

  const beforeEmit = async () => {
    if (routing === 'virtual') {
      /**
       * if `afterVerificationUrl` and modal redirect there,
       * else if `afterVerificationUrl` redirect there,
       * else If modal close it,
       */
      afterVerification?.();
      closeUserVerification();
    } else {
      if (afterVerificationUrl) {
        await navigate(afterVerificationUrl);
      }
    }
  };

  const handlePasswordSubmit: React.FormEventHandler = async e => {
    e.preventDefault();
    return user
      ?.verifySessionAttemptFirstFactor({
        strategy: 'password',
        password: passwordControl.value,
      })
      .then(async res => {
        // await session?.getToken({ skipCache: true });
        // await setActive({ session: session?.id });
        switch (res.status) {
          case 'complete':
            // await session?.getToken({ skipCache: true });
            return setActive({ session: session?.id, beforeEmit });
          case 'needs_second_factor':
            return navigate('../factor-two');
          default:
            return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
        }
      })
      .catch(err => handleError(err, [passwordControl], card.setError));
  };

  // TODO: Update texts
  if (showHavingTrouble) {
    return <HavingTrouble onBackLinkClick={toggleHavingTrouble} />;
  }

  return (
    <Flow.Part part='password'>
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
            <Card.Action elementId={onShowAlternativeMethodsClick ? 'alternativeMethods' : 'havingTrouble'}>
              <Card.ActionLink
                localizationKey={localizationKeys(
                  onShowAlternativeMethodsClick ? 'signIn.password.actionLink' : 'signIn.alternativeMethods.actionLink',
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
}
