import { isPasswordPwnedError, isUserLockedError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
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
  onPasswordPwned?: () => void;
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
  const { onShowAlternativeMethodsClick, onPasswordPwned } = props;
  const passwordInputRef = React.useRef<HTMLInputElement>(null);
  const card = useCardState();
  const { setActive } = useClerk();
  const signIn = useCoreSignIn();
  const { afterSignInUrl } = useSignInContext();
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
      .then(async res => {
        switch (res.status) {
          case 'complete':
            await setActive({
              session: res.createdSessionId,
              redirectUrl: res.createdSession?.status === 'active' ? afterSignInUrl : undefined,
            });
            return navigate('../select-org');
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

        if (isPasswordPwnedError(err) && onPasswordPwned) {
          card.setError({ ...err.errors[0], code: 'form_password_pwned__sign_in' });
          onPasswordPwned();
          return;
        }

        handleError(err, [passwordControl], card.setError);

        setTimeout(() => passwordInputRef.current?.focus(), 0);
      });
  };

  if (showHavingTrouble) {
    return <HavingTrouble onBackLinkClick={toggleHavingTrouble} />;
  }

  return (
    <Flow.Part part='password'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={localizationKeys('signIn.password.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signIn.password.subtitle')} />
            <IdentityPreview
              identifier={signIn.identifier}
              avatarUrl={signIn.userData.imageUrl}
              onClick={goBack}
            />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
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
                  ref={passwordInputRef}
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
