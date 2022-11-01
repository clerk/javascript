import { ClerkAPIError, SignInCreateParams } from '@clerk/types';
import React from 'react';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { getClerkQueryParam } from '../../../utils/getClerkQueryParam';
import { ERROR_CODES, getIdentifierControlDisplayValues } from '../../common/constants';
import { withRedirectToHome } from '../../common/withRedirectToHome';
import { useCoreClerk, useCoreSignIn, useEnvironment, useSignInContext } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { Form, withCardStateProvider } from '../../elements';
import { useCardState } from '../../elements/contexts';
import { useLoadingStatus, useNavigate } from '../../hooks';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { buildRequest, FormControlState, handleError, isMobileDevice, useFormControl } from '../../utils';

export function _SignInStart(): JSX.Element {
  const card = useCardState();
  const status = useLoadingStatus();
  const { userSettings, displayConfig } = useEnvironment();
  const { setActive } = useCoreClerk();
  const signIn = useCoreSignIn();
  const { navigate } = useNavigate();
  const { navigateAfterSignIn, signUpUrl } = useSignInContext();
  const supportEmail = useSupportEmail();

  const organizationTicket = getClerkQueryParam('__clerk_ticket') || '';

  const standardFormAttributes = userSettings.enabledFirstFactorIdentifiers;
  const web3FirstFactors = userSettings.web3FirstFactors;
  const authenticatableSocialStrategies = userSettings.authenticatableSocialStrategies;
  const passwordBasedInstance = userSettings.instanceIsPasswordBased;
  const identifierInputDisplayValues = getIdentifierControlDisplayValues(standardFormAttributes);

  const instantPasswordField = useFormControl('password', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__password'),
    placeholder: localizationKeys('formFieldInputPlaceholder__password') as any,
  });

  const identifierField = useFormControl('identifier', '', {
    ...identifierInputDisplayValues,
    isRequired: true,
  });

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
    return <div>loading</div>;
  }

  const hasSocialOrWeb3Buttons = !!authenticatableSocialStrategies.length || !!web3FirstFactors.length;
  const shouldAutofocus = !isMobileDevice() && hasSocialOrWeb3Buttons;

  return <div>SignInComponent</div>;
}

const InstantPasswordRow = ({ field }: { field?: FormControlState<'password'> }) => {
  if (!field) {
    return null;
  }
  return (
    <Form.ControlRow
      sx={!field.value ? { opacity: 0, height: 0, pointerEvents: 'none', marginTop: '-1rem' } : undefined}
    >
      <Form.Control
        {...field.props}
        tabIndex={!field.value ? -1 : undefined}
      />
    </Form.ControlRow>
  );
};

export const SignInStart = withRedirectToHome(withCardStateProvider(_SignInStart));
