import type { ClerkAPIError, SignInCreateParams } from '@clerk/types';
import React, { useState } from 'react';

import { ERROR_CODES } from '../../../core/constants';
import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { getClerkQueryParam } from '../../../utils';
import { getIdentifierControlDisplayValues, withRedirectToHomeSingleSessionGuard } from '../../common';
import { useCoreClerk, useCoreSignIn, useEnvironment, useSignInContext } from '../../contexts';
import { Col, descriptors, Flow, localizationKeys } from '../../customizables';
import {
  Card,
  CardAlert,
  Footer,
  Form,
  Header,
  LoadingCard,
  SocialButtonsReversibleContainerWithDivider,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { useLoadingStatus, useNavigate } from '../../hooks';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import type { FormControlState } from '../../utils';
import { buildRequest, handleError, isMobileDevice, useFormControl } from '../../utils';
import { SignInSocialButtons } from './SignInSocialButtons';

export function _SignInStart(): JSX.Element {
  const card = useCardState();
  const status = useLoadingStatus();
  const { userSettings } = useEnvironment();
  const { setActive } = useCoreClerk();
  const signIn = useCoreSignIn();
  const { navigate } = useNavigate();
  const { navigateAfterSignIn, signUpUrl } = useSignInContext();
  const supportEmail = useSupportEmail();
  const [identifierIndex, setIdentifierIndex] = useState(0);

  const organizationTicket = getClerkQueryParam('__clerk_ticket') || '';

  const standardFormAttributes = userSettings.enabledFirstFactorIdentifiers;
  const web3FirstFactors = userSettings.web3FirstFactors;
  const authenticatableSocialStrategies = userSettings.authenticatableSocialStrategies;
  const passwordBasedInstance = userSettings.instanceIsPasswordBased;
  const identifierInputDisplayValues = getIdentifierControlDisplayValues(
    userSettings.enabledFirstFactorIdentifiers,
    identifierIndex,
  );
  const instantPasswordField = useFormControl('password', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__password'),
    placeholder: localizationKeys('formFieldInputPlaceholder__password') as any,
  });

  const identifierField = useFormControl('identifier', '', {
    ...identifierInputDisplayValues,
    isRequired: true,
  });

  const switchToNextIdentifier = () => {
    setIdentifierIndex(i => i + 1);
    identifierField.setValue('');
  };

  React.useEffect(() => {
    if (!organizationTicket) {
      return;
    }

    status.setLoading();
    card.setLoading();
    signIn
      .create({
        strategy: 'ticket',
        ticket: organizationTicket,
      })
      .then(res => {
        switch (res.status) {
          case 'needs_first_factor':
            return navigate('factor-one');
          case 'needs_second_factor':
            return navigate('factor-two');
          case 'complete':
            return setActive({
              session: res.createdSessionId,
              beforeEmit: navigateAfterSignIn,
            });
          default: {
            console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
            return;
          }
        }
      })
      .catch(err => {
        return attemptToRecoverFromSignInError(err);
      })
      .finally(() => {
        status.setIdle();
        card.setIdle();
      });
  }, []);

  React.useEffect(() => {
    async function handleOauthError() {
      const error = signIn?.firstFactorVerification?.error;
      if (error) {
        switch (error.code) {
          case ERROR_CODES.NOT_ALLOWED_TO_SIGN_UP:
          case ERROR_CODES.OAUTH_ACCESS_DENIED:
          case ERROR_CODES.NOT_ALLOWED_ACCESS:
            card.setError(error.longMessage);
            break;
          default:
            // Error from server may be too much information for the end user, so set a generic error
            card.setError('Unable to complete action at this time. If the problem persists please contact support.');
        }
        // TODO: This is a workaround in order to reset the sign in attempt
        // so that the oauth error does not persist on full page reloads.
        void (await signIn.create({}));
      }
    }
    void handleOauthError();
  }, []);

  const buildSignInParams = (fields: Array<FormControlState<string>>): SignInCreateParams => {
    const hasPassword = fields.some(f => f.name === 'password' && !!f.value);
    if (!hasPassword) {
      fields = fields.filter(f => f.name !== 'password');
    }
    return {
      ...buildRequest(fields),
      ...(hasPassword && { strategy: 'password' }),
    } as SignInCreateParams;
  };

  const signInWithFields = async (...fields: Array<FormControlState<string>>) => {
    try {
      const res = await signIn.create(buildSignInParams(fields));
      switch (res.status) {
        case 'needs_first_factor':
          return navigate('factor-one');
        case 'needs_second_factor':
          return navigate('factor-two');
        case 'complete':
          return setActive({
            session: res.createdSessionId,
            beforeEmit: navigateAfterSignIn,
          });
        default: {
          console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
          return;
        }
      }
    } catch (e) {
      return attemptToRecoverFromSignInError(e);
    }
  };

  const attemptToRecoverFromSignInError = async (e: any) => {
    if (!e.errors) {
      return;
    }
    const instantPasswordError: ClerkAPIError = e.errors.find(
      (e: ClerkAPIError) =>
        e.code === ERROR_CODES.INVALID_STRATEGY_FOR_USER || e.code === ERROR_CODES.FORM_PASSWORD_INCORRECT,
    );
    const alreadySignedInError: ClerkAPIError = e.errors.find(
      (e: ClerkAPIError) => e.code === 'identifier_already_signed_in',
    );

    if (instantPasswordError) {
      await signInWithFields(identifierField);
    } else if (alreadySignedInError) {
      const sid = alreadySignedInError.meta!.sessionId!;
      await setActive({ session: sid, beforeEmit: navigateAfterSignIn });
    } else {
      handleError(e, [identifierField, instantPasswordField], card.setError);
    }
  };

  const handleFirstPartySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    return signInWithFields(identifierField, instantPasswordField);
  };

  if (status.isLoading) {
    return <LoadingCard />;
  }

  const hasSocialOrWeb3Buttons = !!authenticatableSocialStrategies.length || !!web3FirstFactors.length;
  const shouldAutofocus = !isMobileDevice() && hasSocialOrWeb3Buttons;

  return (
    <Flow.Part part='start'>
      <Card>
        <CardAlert>{card.error}</CardAlert>
        <Header.Root>
          <Header.Title localizationKey={localizationKeys('signIn.start.title')} />
          <Header.Subtitle localizationKey={localizationKeys('signIn.start.subtitle')} />
        </Header.Root>
        {/*TODO: extract main in its own component */}
        <Col
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <SocialButtonsReversibleContainerWithDivider>
            {hasSocialOrWeb3Buttons && (
              <SignInSocialButtons
                enableWeb3Providers
                enableOAuthProviders
              />
            )}
            {standardFormAttributes.length ? (
              <Form.Root onSubmit={handleFirstPartySubmit}>
                <Form.ControlRow elementId={identifierField.id}>
                  <Form.Control
                    actionLabel={identifierInputDisplayValues.action}
                    onActionClicked={switchToNextIdentifier}
                    {...identifierField.props}
                    autoFocus={shouldAutofocus}
                  />
                </Form.ControlRow>
                <InstantPasswordRow field={passwordBasedInstance ? instantPasswordField : undefined} />
                <Form.SubmitButton>Continue</Form.SubmitButton>
              </Form.Root>
            ) : null}
          </SocialButtonsReversibleContainerWithDivider>
        </Col>
        <Footer.Root>
          <Footer.Action elementId='signIn'>
            <Footer.ActionText localizationKey={localizationKeys('signIn.start.actionText')}>
              No account?
            </Footer.ActionText>
            <Footer.ActionLink
              localizationKey={localizationKeys('signIn.start.actionLink')}
              to={signUpUrl}
            >
              Sign up
            </Footer.ActionLink>
          </Footer.Action>
          <Footer.Links />
        </Footer.Root>
      </Card>
    </Flow.Part>
  );
}

const InstantPasswordRow = ({ field }: { field?: FormControlState<'password'> }) => {
  if (!field) {
    return null;
  }
  return (
    <Form.ControlRow
      elementId={field.id}
      sx={!field.value ? { opacity: 0, height: 0, pointerEvents: 'none', marginTop: '-1rem' } : undefined}
    >
      <Form.Control
        {...field.props}
        tabIndex={!field.value ? -1 : undefined}
      />
    </Form.ControlRow>
  );
};

export const SignInStart = withRedirectToHomeSingleSessionGuard(withCardStateProvider(_SignInStart));
