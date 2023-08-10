import React from 'react';

import { ERROR_CODES } from '../../../core/constants';
import { getClerkQueryParam } from '../../../utils/getClerkQueryParam';
import { buildSSOCallbackURL, withRedirectToHomeSingleSessionGuard } from '../../common';
import { useCoreClerk, useCoreSignUp, useEnvironment, useSignUpContext } from '../../contexts';
import { descriptors, Flex, Flow, localizationKeys, useAppearance, useLocalizations } from '../../customizables';
import {
  Card,
  CardAlert,
  Footer,
  Header,
  LoadingCard,
  SocialButtonsReversibleContainerWithDivider,
  withCardStateProvider,
} from '../../elements';
import { useCardState } from '../../elements/contexts';
import { useLoadingStatus, usePasswordComplexity } from '../../hooks';
import { useRouter } from '../../router';
import type { FormControlState } from '../../utils';
import { createPasswordError } from '../../utils';
import { buildRequest, handleError, useFormControl } from '../../utils';
import { SignUpForm } from './SignUpForm';
import type { ActiveIdentifier } from './signUpFormHelpers';
import { determineActiveFields, emailOrPhone, getInitialActiveIdentifier, showFormFields } from './signUpFormHelpers';
import { SignUpSocialButtons } from './SignUpSocialButtons';
import { completeSignUpFlow } from './util';

function _SignUpStart(): JSX.Element {
  const card = useCardState();
  const clerk = useCoreClerk();
  const status = useLoadingStatus();
  const signUp = useCoreSignUp();
  const { showOptionalFields } = useAppearance().parsedLayout;
  const { userSettings, displayConfig } = useEnvironment();
  const { navigate } = useRouter();
  const { attributes } = userSettings;
  const { setActive } = useCoreClerk();
  const ctx = useSignUpContext();
  const { navigateAfterSignUp, signInUrl, unsafeMetadata } = ctx;
  const [activeCommIdentifierType, setActiveCommIdentifierType] = React.useState<ActiveIdentifier>(
    getInitialActiveIdentifier(attributes, userSettings.signUp.progressive),
  );
  const { t, locale } = useLocalizations();

  const [missingRequirementsWithTicket, setMissingRequirementsWithTicket] = React.useState(false);

  const {
    userSettings: { passwordSettings },
  } = useEnvironment();
  const { failedValidationsText } = usePasswordComplexity(passwordSettings);

  const formState = {
    firstName: useFormControl('firstName', signUp.firstName || '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__firstName'),
      placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
    }),
    lastName: useFormControl('lastName', signUp.lastName || '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__lastName'),
      placeholder: localizationKeys('formFieldInputPlaceholder__lastName'),
    }),
    emailAddress: useFormControl('emailAddress', signUp.emailAddress || '', {
      type: 'email',
      label: localizationKeys('formFieldLabel__emailAddress'),
      placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
    }),
    username: useFormControl('username', signUp.username || '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__username'),
      placeholder: localizationKeys('formFieldInputPlaceholder__username'),
    }),
    phoneNumber: useFormControl('phoneNumber', signUp.phoneNumber || '', {
      type: 'tel',
      label: localizationKeys('formFieldLabel__phoneNumber'),
      placeholder: localizationKeys('formFieldInputPlaceholder__phoneNumber'),
    }),
    password: useFormControl('password', '', {
      type: 'password',
      label: localizationKeys('formFieldLabel__password'),
      placeholder: localizationKeys('formFieldInputPlaceholder__password'),
      informationText: failedValidationsText,
      validatePassword: true,
      buildErrorMessage: errors => createPasswordError(errors, { t, locale, passwordSettings }),
      passwordMinLength: passwordSettings.min_length,
    }),
    ticket: useFormControl(
      'ticket',
      getClerkQueryParam('__clerk_ticket') || getClerkQueryParam('__clerk_invitation_token') || '',
    ),
  } as const;

  const hasTicket = !!formState.ticket.value;
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
    if (!formState.ticket.value) {
      return;
    }
    status.setLoading();
    card.setLoading();
    signUp
      .create({ strategy: 'ticket', ticket: formState.ticket.value })
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
          handleComplete: () => setActive({ session: signUp.createdSessionId, beforeEmit: navigateAfterSignUp }),
          navigate,
        });
      })
      .catch(err => {
        /* Clear ticket values when an error occurs in the initial sign up attempt */
        formState.ticket.setValue('');
        handleError(err, [], card.setError);
      })
      .finally(() => {
        status.setIdle();
        card.setIdle();
      });
  };

  React.useLayoutEffect(() => {
    void handleTokenFlow();
  }, []);

  React.useEffect(() => {
    async function handleOauthError() {
      const error = signUp.verifications.externalAccount.error;

      if (error) {
        switch (error.code) {
          case ERROR_CODES.NOT_ALLOWED_TO_SIGN_UP:
          case ERROR_CODES.OAUTH_ACCESS_DENIED:
          case ERROR_CODES.NOT_ALLOWED_ACCESS:
          case ERROR_CODES.SAML_USER_ATTRIBUTE_MISSING:
          case ERROR_CODES.OAUTH_EMAIL_DOMAIN_RESERVED_BY_SAML:
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
  }, []);

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

    if (unsafeMetadata) {
      fieldsToSubmit.push({ id: 'unsafeMetadata', value: unsafeMetadata } as any);
    }

    if (fields.ticket) {
      const noop = () => {
        //
      };
      // fieldsToSubmit: Constructing a fake fields object for strategy.
      fieldsToSubmit.push({ id: 'strategy', value: 'ticket', setValue: noop, onChange: noop, setError: noop } as any);
    }

    // In case of emailOrPhone (both email & phone are optional) and neither of them is provided,
    // add both to the submitted fields to trigger and render an error for both respective inputs
    const emailAddressProvided = !!(fieldsToSubmit.find(f => f.id === 'emailAddress')?.value || '');
    const phoneNumberProvided = !!(fieldsToSubmit.find(f => f.id === 'phoneNumber')?.value || '');

    if (!emailAddressProvided && !phoneNumberProvided && emailOrPhone(attributes, isProgressiveSignUp)) {
      fieldsToSubmit.push(formState['emailAddress']);
      fieldsToSubmit.push(formState['phoneNumber']);
    }

    card.setLoading();
    card.setError(undefined);

    const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signUpUrl);
    const redirectUrlComplete = ctx.afterSignUpUrl || displayConfig.afterSignUpUrl;

    return signUp
      .create(buildRequest(fieldsToSubmit))
      .then(res =>
        completeSignUpFlow({
          signUp: res,
          verifyEmailPath: 'verify-email-address',
          verifyPhonePath: 'verify-phone-number',
          handleComplete: () => setActive({ session: res.createdSessionId, beforeEmit: navigateAfterSignUp }),
          navigate,
          redirectUrl,
          redirectUrlComplete,
        }),
      )
      .catch(err => handleError(err, fieldsToSubmit, card.setError))
      .finally(() => card.setIdle());
  };

  if (status.isLoading) {
    return <LoadingCard />;
  }

  const canToggleEmailPhone = emailOrPhone(attributes, isProgressiveSignUp);
  const visibleFields = Object.entries(fields).filter(([_, opts]) => showOptionalFields || opts?.required);
  const shouldShowForm = showFormFields(userSettings) && visibleFields.length > 0;

  const showOauthProviders =
    (!hasTicket || missingRequirementsWithTicket) && userSettings.authenticatableSocialStrategies.length > 0;
  const showWeb3Providers = !hasTicket && userSettings.web3FirstFactors.length > 0;

  return (
    <Flow.Part part='start'>
      <Card>
        <CardAlert>{card.error}</CardAlert>
        <Header.Root>
          <Header.Title localizationKey={localizationKeys('signUp.start.title')} />
          <Header.Subtitle localizationKey={localizationKeys('signUp.start.subtitle')} />
        </Header.Root>
        <Flex
          direction='col'
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <SocialButtonsReversibleContainerWithDivider>
            {(showOauthProviders || showWeb3Providers) && (
              <SignUpSocialButtons
                enableOAuthProviders={showOauthProviders}
                enableWeb3Providers={showWeb3Providers}
                continueSignUp={missingRequirementsWithTicket}
              />
            )}
            {shouldShowForm && (
              <SignUpForm
                handleSubmit={handleSubmit}
                fields={fields}
                formState={formState}
                canToggleEmailPhone={canToggleEmailPhone}
                handleEmailPhoneToggle={handleChangeActive}
              />
            )}
          </SocialButtonsReversibleContainerWithDivider>
        </Flex>
        <Footer.Root>
          <Footer.Action elementId='signUp'>
            <Footer.ActionText localizationKey={localizationKeys('signUp.start.actionText')} />
            <Footer.ActionLink
              localizationKey={localizationKeys('signUp.start.actionLink')}
              to={clerk.buildUrlWithAuth(signInUrl)}
            />
          </Footer.Action>
          <Footer.Links />
        </Footer.Root>
      </Card>
    </Flow.Part>
  );
}

export const SignUpStart = withRedirectToHomeSingleSessionGuard(withCardStateProvider(_SignUpStart));
