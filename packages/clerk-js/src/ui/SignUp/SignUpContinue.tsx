import React from 'react';

import { withRedirectToHome } from '../../ui/common/withRedirectToHome';
import { useCoreClerk, useCoreSignUp, useEnvironment, useSignUpContext } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks';
import { descriptors, Flex, Flow, localizationKeys } from '../customizables';
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
import { buildRequest, FormControlState, handleError, useFormControl } from '../utils';
import { SignUpForm } from './SignUpForm';
import {
  ActiveIdentifier,
  determineActiveFields,
  emailOrPhone,
  getInitialActiveIdentifier,
  minimizeFieldsForExistingSignup,
  showFormFields,
} from './signUpFormHelpers';
import { SignUpSocialButtons } from './SignUpSocialButtons';
import { completeSignUpFlow } from './util';

function _SignUpContinue() {
  const card = useCardState();
  const { navigate } = useNavigate();
  const { displayConfig, userSettings } = useEnvironment();
  const { attributes } = userSettings;
  const { setActive } = useCoreClerk();
  const { navigateAfterSignUp, signInUrl } = useSignUpContext();
  const signUp = useCoreSignUp();
  const isProgressiveSignUp = userSettings.signUp.progressive;
  const [activeCommIdentifierType, setActiveCommIdentifierType] = React.useState<ActiveIdentifier>(
    getInitialActiveIdentifier(attributes, userSettings.signUp.progressive),
  );

  // Redirect to sign-up if there is no persisted sign-up
  if (!signUp.id) {
    void navigate(displayConfig.signUpUrl);
    return <LoadingCard />;
  }

  // TODO: This form should be shared between SignUpStart and SignUpContinue
  const formState = {
    firstName: useFormControl('firstName', '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__firstName'),
      placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
    }),
    lastName: useFormControl('lastName', '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__lastName'),
      placeholder: localizationKeys('formFieldInputPlaceholder__lastName'),
    }),
    emailAddress: useFormControl('emailAddress', '', {
      type: 'email',
      label: localizationKeys('formFieldLabel__emailAddress'),
      placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
    }),
    username: useFormControl('username', '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__username'),
      placeholder: localizationKeys('formFieldInputPlaceholder__username'),
    }),
    phoneNumber: useFormControl('phoneNumber', '', {
      type: 'tel',
      label: localizationKeys('formFieldLabel__phoneNumber'),
      placeholder: localizationKeys('formFieldInputPlaceholder__phoneNumber'),
    }),
    password: useFormControl('password', '', {
      type: 'password',
      label: localizationKeys('formFieldLabel__password'),
      placeholder: localizationKeys('formFieldInputPlaceholder__password'),
    }),
  } as const;

  const hasEmail = !!formState.emailAddress.value;
  const hasVerifiedExternalAccount = signUp.verifications?.externalAccount?.status == 'verified';
  const hasVerifiedWeb3 = signUp.verifications?.web3Wallet?.status == 'verified';

  const fields = determineActiveFields({
    attributes,
    hasEmail,
    activeCommIdentifierType,
    signUp,
    isProgressiveSignUp,
  });
  minimizeFieldsForExistingSignup(fields, signUp);

  const oauthOptions = userSettings.socialProviderStrategies;
  const web3Options = userSettings.web3FirstFactors;

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
    return signUp
      .update(buildRequest(fieldsToSubmit))
      .then(res =>
        completeSignUpFlow({
          signUp: res,
          verifyEmailPath: '../verify-email-address',
          verifyPhonePath: '../verify-phone-number',
          handleComplete: () => setActive({ session: res.createdSessionId, beforeEmit: navigateAfterSignUp }),
          navigate,
        }),
      )
      .catch(err => handleError(err, fieldsToSubmit, card.setError))
      .finally(() => card.setIdle());
  };

  const canToggleEmailPhone = emailOrPhone(attributes, isProgressiveSignUp);
  const showSocialButtons =
    (!hasVerifiedExternalAccount && oauthOptions.length > 0) || (!hasVerifiedWeb3 && web3Options.length > 0);

  return (
    <Flow.Part part='complete'>
      <Card>
        <CardAlert>{card.error}</CardAlert>
        <Header.Root>
          <Header.Title localizationKey={localizationKeys('signUp.continue.title')} />
          <Header.Subtitle
            localizationKey={localizationKeys('signUp.continue.subtitle', {
              applicationName: displayConfig.applicationName,
            })}
          />
        </Header.Root>
        <Flex
          direction='col'
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <SocialButtonsReversibleContainer>
            {showSocialButtons && <SignUpSocialButtons />}
            {showSocialButtons && showFormFields(userSettings) && <Divider />}
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
            <Footer.ActionText localizationKey={localizationKeys('signUp.continue.actionText')} />
            <Footer.ActionLink
              localizationKey={localizationKeys('signUp.continue.actionLink')}
              to={signInUrl}
            />
          </Footer.Action>
          <Footer.Links />
        </Footer.Root>
      </Card>
    </Flow.Part>
  );
}

// TODO: flow / page naming
export const SignUpContinue = withRedirectToHome(withCardStateProvider(_SignUpContinue));
