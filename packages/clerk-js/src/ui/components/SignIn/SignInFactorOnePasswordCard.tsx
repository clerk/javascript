import { isUserLockedError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import type { ResetPasswordCodeFactor } from '@clerk/types';
import React from 'react';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import { descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import { Card, Form, Header, IdentityPreview, useCardState } from '../../elements';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router/RouteContext';
import { handleError, useFormControl } from '../../utils';
import { HavingTrouble } from './HavingTrouble';
import { useResetPasswordFactor } from './useResetPasswordFactor';

type SignInFactorOnePasswordProps = {
  onForgotPasswordMethodClick: React.MouseEventHandler | undefined;
  onShowAlternativeMethodsClick: React.MouseEventHandler | undefined;
  onFactorPrepare: (f: ResetPasswordCodeFactor) => void;
};

const usePasswordControl = (props: SignInFactorOnePasswordProps) => {
  const { onForgotPasswordMethodClick, onShowAlternativeMethodsClick } = props;
  const resetPasswordFactor = useResetPasswordFactor();

  const passwordControl = useFormControl('password', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__password'),
    placeholder: localizationKeys('formFieldInputPlaceholder__password'),
  });

  return {
    ...passwordControl,
    props: {
      ...passwordControl.props,
      actionLabel:
        resetPasswordFactor || onShowAlternativeMethodsClick ? localizationKeys('formFieldAction__forgotPassword') : '',
      onActionClicked: onForgotPasswordMethodClick
        ? onForgotPasswordMethodClick
        : onShowAlternativeMethodsClick
        ? onShowAlternativeMethodsClick
        : () => null,
    },
  };
};

export const SignInFactorOnePasswordCard = (props: SignInFactorOnePasswordProps) => {
  const { onShowAlternativeMethodsClick } = props;
  const card = useCardState();
  const { setActive } = useClerk();
  const signIn = useCoreSignIn();
  const { navigateAfterSignIn } = useSignInContext();
  const supportEmail = useSupportEmail();
  const passwordControl = usePasswordControl(props);
  const { navigate } = useRouter();
  const [showHavingTrouble, setShowHavingTrouble] = React.useState(false);
  const toggleHavingTrouble = React.useCallback(() => setShowHavingTrouble(s => !s), [setShowHavingTrouble]);
  const clerk = useClerk();

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
      .catch(err => {
        if (isUserLockedError(err)) {
          // @ts-expect-error -- private method for the time being
          return clerk.__internal_navigateWithError('..', err.errors[0]);
        }

        handleError(err, [passwordControl], card.setError);
      });
  };

  if (showHavingTrouble) {
    return <HavingTrouble onBackLinkClick={toggleHavingTrouble} />;
  }

  return (
    <Flow.Part part='password'>
      <Card.Root>
        <Card.Content gap={6}>
          <Card.Alert>{card.error}</Card.Alert>
          <Header.Root gap={1}>
            <Header.Title localizationKey={localizationKeys('signIn.password.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signIn.password.subtitle')} />
            <IdentityPreview
              identifier={signIn.identifier}
              avatarUrl={signIn.userData.imageUrl}
              onClick={goBack}
            />
          </Header.Root>
          {/*TODO: extract main in its own component */}
          <Flex
            direction='col'
            elementDescriptor={descriptors.main}
            gap={4}
          >
            <Form.Root
              onSubmit={handlePasswordSubmit}
              gap={8}
            >
              {/* For password managers */}
              <input
                readOnly
                id='identifier-field'
                name='identifier'
                value={signIn.identifier || ''}
                style={{ display: 'none' }}
              />
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
          </Flex>
        </Card.Content>

        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
};
