import { isPasswordCompromisedError, isPasswordPwnedError, isUserLockedError } from '@clerk/shared/error';
import { clerkInvalidFAPIResponse } from '@clerk/shared/internal/clerk-js/errors';
import { useClerk } from '@clerk/shared/react';
import React from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { IdentityPreview } from '@/ui/elements/IdentityPreview';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useCoreSignIn, useSignInContext } from '../../contexts';
import { descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router/RouteContext';
import { HavingTrouble } from './HavingTrouble';
import { useResetPasswordFactor } from './useResetPasswordFactor';

export type PasswordErrorCode = 'compromised' | 'pwned';

type SignInFactorOnePasswordProps = {
  onForgotPasswordMethodClick: React.MouseEventHandler | undefined;
  onShowAlternativeMethodsClick: React.MouseEventHandler | undefined;
  onPasswordError?: (errorCode: PasswordErrorCode) => void;
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
  const { onShowAlternativeMethodsClick, onPasswordError } = props;
  const passwordInputRef = React.useRef<HTMLInputElement>(null);
  const card = useCardState();
  const { setActive } = useClerk();
  const signIn = useCoreSignIn();
  const { afterSignInUrl, navigateOnSetActive } = useSignInContext();
  const supportEmail = useSupportEmail();
  const passwordControl = usePasswordControl(props);
  const { navigate } = useRouter();
  const [showHavingTrouble, setShowHavingTrouble] = React.useState(false);
  const toggleHavingTrouble = React.useCallback(() => setShowHavingTrouble(s => !s), [setShowHavingTrouble]);
  const clerk = useClerk();

  const goBack = () => {
    void navigate('../');
  };

  const handlePasswordSubmit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    void signIn
      .attemptFirstFactor({ strategy: 'password', password: passwordControl.value })
      .then(res => {
        switch (res.status) {
          case 'complete':
            return setActive({
              session: res.createdSessionId,
              navigate: ({ session, decorateUrl }) => {
                return navigateOnSetActive({ session, redirectUrl: afterSignInUrl, decorateUrl });
              },
            });
          case 'needs_second_factor':
            return navigate('../factor-two');
          case 'needs_client_trust':
            return navigate('../client-trust');
          default:
            return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
        }
      })
      .catch(err => {
        if (isUserLockedError(err)) {
          // @ts-expect-error -- private method for the time being
          return clerk.__internal_navigateWithError('..', err.errors[0]);
        }

        if (onPasswordError) {
          if (isPasswordPwnedError(err)) {
            card.setError({ ...err.errors[0], code: 'form_password_pwned__sign_in' });
            onPasswordError('pwned');
            return;
          }

          if (isPasswordCompromisedError(err)) {
            card.setError({ ...err.errors[0], code: 'form_password_compromised__sign_in' });
            onPasswordError('compromised');
            return;
          }
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
