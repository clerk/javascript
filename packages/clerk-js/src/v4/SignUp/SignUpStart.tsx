import React from 'react';

import { ERROR_CODES } from '../../ui/common/constants';
import { withRedirectToHome } from '../../ui/common/withRedirectToHome';
import { useCoreClerk, useCoreSignUp, useEnvironment, useSignUpContext } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks';
import {
  ActiveIdentifier,
  determineActiveFields,
  emailOrPhone,
  getInitialActiveIdentifier,
  showFormFields,
} from '../../ui/signUp/signUpFormHelpers';
import { completeSignUpFlow } from '../../ui/signUp/util';
import { getClerkQueryParam } from '../../utils/getClerkQueryParam';
import { descriptors, Flex, Flow } from '../customizables';
import {
  Card,
  CardAlert,
  Divider,
  Footer,
  Header,
  LoadingCard,
  SocialButtonsReversibleContainer,
  withCardStateProvider,
} from '../elements';
import { useCardState } from '../elements/contexts';
import { useLoadingStatus } from '../hooks';
import { buildRequest, FormControlState, handleError, useFormControl } from '../utils';
import { SignUpForm } from './SignUpForm';
import { SignUpSocialButtons } from './SignUpSocialButtons';

function _SignUpStart(): JSX.Element {
  const card = useCardState();
  const status = useLoadingStatus();
  const signUp = useCoreSignUp();
  const { userSettings, displayConfig } = useEnvironment();
  const { navigate } = useNavigate();
  const { attributes } = userSettings;
  const { setSession } = useCoreClerk();
  const { navigateAfterSignUp, signInUrl } = useSignUpContext();
  const [activeCommIdentifierType, setActiveCommIdentifierType] = React.useState<ActiveIdentifier>(
    getInitialActiveIdentifier(attributes, userSettings.signUp.progressive),
  );
  const [missingRequirementsWithTicket, setMissingRequirementsWithTicket] = React.useState(false);

  const formState = {
    firstName: useFormControl('firstName', '', { type: 'text', label: 'First name' }),
    lastName: useFormControl('lastName', '', { type: 'text', label: 'Last name' }),
    emailAddress: useFormControl('emailAddress', '', { type: 'email', label: 'Email address' }),
    username: useFormControl('username', '', { type: 'text', label: 'Username' }),
    phoneNumber: useFormControl('phoneNumber', '', { type: 'tel', label: 'Phone number' }),
    password: useFormControl('password', '', { type: 'password', label: 'Password' }),
  } as const;
  const ticket = useFormControl(
    'ticket',
    getClerkQueryParam('__clerk_ticket') || getClerkQueryParam('__clerk_invitation_token') || '',
  );

  const hasTicket = !!ticket.value;
  const hasEmail = !!formState.emailAddress.value;
  const isProgressiveSignUp = userSettings.signUp.progressive;

  const fields = determineActiveFields({
    attributes,
    hasTicket,
    hasEmail,
    activeCommIdentifierType,
    isProgressiveSignUp,
  });

  const handleTokenFlow = () => {
    if (!ticket.value) {
      return;
    }
    status.setLoading();
    card.setLoading();
    signUp
      .create({ strategy: 'ticket', ticket: ticket.value })
      .then(signUp => {
        formState.emailAddress.setValue(signUp.emailAddress || '');
        // In case we are in a Ticket flow and the sign up is not complete yet, update the state
        // to render properly the SignUp form with other available options to complete it (e.g. OAuth)
        if (signUp.status === 'missing_requirements') {
          setMissingRequirementsWithTicket(true);
        }

        return completeSignUpFlow({
          signUp,
          verifyEmailPath: 'verify-email-address',
          verifyPhonePath: 'verify-phone-number',
          handleComplete: () => setSession(signUp.createdSessionId, navigateAfterSignUp),
          navigate,
        });
      })
      .catch(err => {
        /* Clear ticket values when an error occurs in the initial sign up attempt */
        ticket.setValue('');
        handleError(err, [], card.setError);
      })
      .finally(() => {
        status.setIdle();
        card.setIdle();
      });
  };

  React.useLayoutEffect(() => {
    // Don't proceed with token flow if there are still optional fields to fill in
    if (Object.values(fields).some(f => f && !f.required)) {
      return;
    }
    void handleTokenFlow();
  }, []);

  React.useEffect(() => {
    async function handleOauthError() {
      const error = signUp.verifications.externalAccount.error;

      if (error) {
        switch (error.code) {
          case ERROR_CODES.NOT_ALLOWED_TO_SIGN_UP:
          case ERROR_CODES.OAUTH_ACCESS_DENIED:
            card.setError(error.longMessage);
            break;
          default:
            // Error from server may be too much information for the end user, so set a generic error
            card.setError('Unable to complete action at this time. If the problem persists please contact support.');
        }

        // TODO: This is a hack to reset the sign in attempt so that the oauth error
        // does not persist on full page reloads.
        // We will revise this strategy as part of the Clerk DX epic.
        void (await signUp.create({}));
      }
    }

    void handleOauthError();
  });

  const handleChangeActive = (type: ActiveIdentifier) => {
    if (!emailOrPhone(attributes, isProgressiveSignUp)) {
      return;
    }
    setActiveCommIdentifierType(type);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    type FormStateKey = keyof typeof formState;
    const fieldsToSubmit = Object.entries(fields).reduce(
      (acc, [k, v]) => [...acc, ...(v && formState[k as FormStateKey] ? [formState[k as FormStateKey]] : [])],
      [] as Array<FormControlState>,
    );

    if (fields.ticket) {
      // fieldsToSubmit: Constructing a fake fields object for strategy.
      fieldsToSubmit.push({ id: 'strategy', value: 'ticket' } as any);
    }

    card.setLoading();
    card.setError(undefined);
    return signUp
      .create(buildRequest(fieldsToSubmit))
      .then(res =>
        completeSignUpFlow({
          signUp: res,
          verifyEmailPath: 'verify-email-address',
          verifyPhonePath: 'verify-phone-number',
          handleComplete: () => setSession(res.createdSessionId, navigateAfterSignUp),
          navigate,
        }),
      )
      .catch(err => handleError(err, fieldsToSubmit, card.setError))
      .finally(() => card.setIdle());
  };

  if (status.isLoading) {
    return <LoadingCard />;
  }

  const canToggleEmailPhone = emailOrPhone(attributes, isProgressiveSignUp);
  const hasSocialOrWeb3Buttons =
    !!userSettings.socialProviderStrategies.length || !!userSettings.web3FirstFactors.length;

  return (
    <Flow.Part part='start'>
      <Card>
        <CardAlert>{card.error}</CardAlert>
        <Header.Root>
          <Header.Title>Create your account</Header.Title>
          <Header.Subtitle>to continue to {displayConfig.applicationName}</Header.Subtitle>
        </Header.Root>
        <Flex
          direction='col'
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <SocialButtonsReversibleContainer>
            {(!hasTicket || missingRequirementsWithTicket) && <SignUpSocialButtons />}
            {hasSocialOrWeb3Buttons && <Divider />}
            {showFormFields(userSettings) && (
              <SignUpForm
                handleSubmit={handleSubmit}
                fields={fields}
                formState={formState}
                canToggleEmailPhone={canToggleEmailPhone}
                handleEmailPhoneToggle={handleChangeActive}
              />
            )}
          </SocialButtonsReversibleContainer>
        </Flex>
        <Footer.Root>
          <Footer.Action>
            <Footer.ActionText>Have an account?</Footer.ActionText>
            <Footer.ActionLink to={signInUrl}>Sign in</Footer.ActionLink>
          </Footer.Action>
          <Footer.Links />
        </Footer.Root>
      </Card>
    </Flow.Part>
  );
}

export const SignUpStart = withRedirectToHome(withCardStateProvider(_SignUpStart));
