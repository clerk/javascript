import { Control } from '@clerk/shared/components/control';
import { Form } from '@clerk/shared/components/form';
import { Input } from '@clerk/shared/components/input';
import { PhoneInput } from '@clerk/shared/components/phoneInput';
import { SignUpResource } from '@clerk/types';
import React from 'react';
import type { FieldState } from 'ui/common';
import {
  buildRequest,
  Footer,
  handleError,
  PoweredByClerk,
  Separator,
  useFieldState,
  withRedirectToHome,
} from 'ui/common';
import { Body, Header } from 'ui/common/authForms';
import { useCoreClerk, useCoreSignUp, useEnvironment, useSignUpContext } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';

import { SignInLink } from './SignInLink';
import { SignUpOAuth } from './SignUpOAuth';
import { SignUpWeb3 } from './SignUpWeb3';
import { determineFirstPartyFields } from './utils';

type ActiveIdentifier = 'emailAddress' | 'phoneNumber';

function _SignUpContinue(): JSX.Element | null {
  const { navigate } = useNavigate();
  const environment = useEnvironment();
  const { displayConfig, userSettings } = environment;
  const { setSession } = useCoreClerk();
  const { navigateAfterSignUp } = useSignUpContext();
  const [emailOrPhoneActive, setEmailOrPhoneActive] = React.useState<ActiveIdentifier>('emailAddress');
  const signUp = useCoreSignUp();

  // Redirect to sign-up if there is no persisted sign-up
  if (!signUp.id) {
    void navigate(displayConfig.signUpUrl);
    return null;
  }

  // Pre-populate fields from existing sign-up object
  const formFields = {
    firstName: useFieldState('first_name', signUp.firstName || ''),
    lastName: useFieldState('last_name', signUp.lastName || ''),
    emailAddress: useFieldState('email_address', signUp.emailAddress || ''),
    username: useFieldState('username', signUp.username || ''),
    phoneNumber: useFieldState('phone_number', signUp.phoneNumber || ''),
    password: useFieldState('password', ''),
  } as const;

  type FormFieldsKey = keyof typeof formFields;

  const [error, setError] = React.useState<string | undefined>();

  const hasVerifiedEmail = signUp.verifications?.emailAddress?.status == 'verified';
  const hasVerifiedPhone = signUp.verifications?.phoneNumber?.status == 'verified';
  const hasVerifiedExternalAccount = signUp.verifications?.externalAccount?.status == 'verified';

  const fields = determineFirstPartyFields(environment, false);

  // Show only fields absolutely necessary for completing sign-up to minimize fiction

  if (hasVerifiedEmail) {
    delete fields.emailAddress;
    delete fields.emailOrPhone;
  }

  if (hasVerifiedPhone) {
    delete fields.phoneNumber;
    delete fields.emailOrPhone;
  }

  if (hasVerifiedExternalAccount) {
    delete fields.password;
  }

  if (signUp.firstName) {
    delete fields.firstName;
  }

  if (signUp.lastName) {
    delete fields.lastName;
  }

  if (signUp.username) {
    delete fields.username;
  }

  // Remove any non-required fields
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== 'required') {
      // @ts-ignore
      delete fields[k];
    }
  });

  const oauthOptions = userSettings.socialProviderStrategies;
  const web3Options = userSettings.web3FirstFactors;

  // Handle oauth errors?

  // React.useEffect(() => {
  //   async function handleOauthError() {
  //     const error = signUp.verifications.externalAccount.error;
  //
  //     if (error) {
  //       switch (error.code) {
  //         case ERROR_CODES.NOT_ALLOWED_TO_SIGN_UP:
  //         case ERROR_CODES.OAUTH_ACCESS_DENIED:
  //           setError(error.longMessage);
  //           break;
  //         default:
  //           // Error from server may be too much information for the end user, so set a generic error
  //           setError('Unable to complete action at this time. If the problem persists please contact support.');
  //       }
  //
  //       // TODO: This is a hack to reset the sign in attempt so that the oauth error
  //       // does not persist on full page reloads.
  //       //
  //       // We will revise this strategy as part of the Clerk DX epic.
  //       void (await signUp.create({}));
  //     }
  //   }
  //
  //   void handleOauthError();
  // });

  const handleChangeActive = (type: ActiveIdentifier) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (!fields.emailOrPhone) {
      return;
    }
    setEmailOrPhoneActive(type);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const reqFields = Object.entries(fields).reduce(
      (acc, [k, v]) => [...acc, ...(v && formFields[k as FormFieldsKey] ? [formFields[k as FormFieldsKey]] : [])],
      [] as Array<FieldState<any>>,
    );

    if (fields.emailOrPhone && emailOrPhoneActive === 'emailAddress') {
      reqFields.push(formFields.emailAddress);
    }

    if (fields.emailOrPhone && emailOrPhoneActive === 'phoneNumber') {
      reqFields.push(formFields.phoneNumber);
    }

    try {
      setError(undefined);
      const req = buildRequest(reqFields);
      const res = await signUp.update(req);
      return completeSignUpFlow(res);
    } catch (err) {
      handleError(err, reqFields, setError);
    }
  };

  const completeSignUpFlow = (su: SignUpResource) => {
    if (su.status === 'complete') {
      return setSession(su.createdSessionId, navigateAfterSignUp);
    } else if (su.emailAddress && su.verifications.emailAddress.status !== 'verified') {
      return navigate('../verify-email-address');
    } else if (su.phoneNumber && su.verifications.phoneNumber.status !== 'verified') {
      return navigate('../verify-phone-number');
    } else if (su.status === 'missing_requirements') {
      // do nothing
    }
  };

  const firstNameField = fields.firstName ? (
    <Control
      className='cl-half-field'
      htmlFor='firstName'
      key='firstName'
      label='First name'
      error={formFields.firstName.error}
      hint={fields.firstName === 'on' ? 'Optional' : undefined}
    >
      <Input
        id='firstName'
        name='firstName'
        value={formFields.firstName.value}
        handleChange={el => formFields.firstName.setValue(el.value || '')}
      />
    </Control>
  ) : null;

  const lastNameField = fields.lastName ? (
    <Control
      className='cl-half-field'
      htmlFor='lastName'
      key='lastName'
      label='Last name'
      error={formFields.lastName.error}
      hint={fields.lastName === 'on' ? 'Optional' : undefined}
    >
      <Input
        id='lastName'
        name='lastName'
        value={formFields.lastName.value}
        handleChange={el => formFields.lastName.setValue(el.value || '')}
      />
    </Control>
  ) : null;

  const nameField = (fields.firstName || fields.lastName) && (
    <div className='cl-field-row'>
      {firstNameField}
      {lastNameField}
    </div>
  );

  const usernameField = fields.username ? (
    <Control
      htmlFor='username'
      key='username'
      label='Username'
      error={formFields.username.error}
      hint={fields.username === 'on' ? 'Optional' : undefined}
    >
      <Input
        id='username'
        name='username'
        value={formFields.username.value}
        handleChange={el => formFields.username.setValue(el.value || '')}
      />
    </Control>
  ) : null;

  const passwordField = fields.password ? (
    <Control
      key='password'
      htmlFor='password'
      label='Password'
      error={formFields.password.error}
    >
      <Input
        id='password'
        type='password'
        name='password'
        value={formFields.password.value}
        handleChange={el => formFields.password.setValue(el.value || '')}
      />
    </Control>
  ) : null;

  const shouldShowEmailAddressField =
    fields.emailAddress || (fields.emailOrPhone && emailOrPhoneActive === 'emailAddress');

  const emailAddressField = shouldShowEmailAddressField && (
    <Control
      key='emailAddress'
      htmlFor='emailAddress'
      label='Email address'
      error={formFields.emailAddress.error}
      hint={fields.emailOrPhone ? 'Use phone instead' : undefined}
      hintOnClickHandler={handleChangeActive('phoneNumber')}
    >
      <Input
        id='emailAddress'
        type='email'
        name='emailAddress'
        value={formFields.emailAddress.value}
        handleChange={el => formFields.emailAddress.setValue(el.value || '')}
      />
    </Control>
  );

  const shouldShowPhoneNumberField =
    fields.phoneNumber || (fields.emailOrPhone && emailOrPhoneActive === 'phoneNumber');

  const phoneNumberField = shouldShowPhoneNumberField ? (
    <Control
      key='phoneNumber'
      htmlFor='phoneNumber'
      label='Phone number'
      error={formFields.phoneNumber.error}
      hint={fields.emailOrPhone ? 'Use email instead' : undefined}
      hintOnClickHandler={handleChangeActive('emailAddress')}
    >
      <PhoneInput
        id='phoneNumber'
        name='phoneNumber'
        handlePhoneChange={formFields.phoneNumber.setValue}
      />
    </Control>
  ) : null;

  const atLeastOneFormField = nameField || usernameField || emailAddressField || phoneNumberField || passwordField;

  const showOauthProviders = !hasVerifiedExternalAccount && oauthOptions.length > 0;

  const showWeb3Providers = web3Options.length > 0;

  return (
    <>
      <Header
        error={error}
        info={'Please fill in the following information to complete your sign-up'}
        className='cl-auth-form-header-compact'
      />
      <Body>
        {showOauthProviders && (
          <SignUpOAuth
            oauthOptions={oauthOptions}
            setError={setError}
          />
        )}
        {showWeb3Providers && (
          <SignUpWeb3
            web3Options={web3Options}
            setError={setError}
          />
        )}
        {atLeastOneFormField && (
          <>
            {(showOauthProviders || showWeb3Providers) && <Separator />}

            {/* @ts-ignore */}
            <Form
              handleSubmit={handleSubmit}
              submitButtonClassName='cl-sign-up-button'
              submitButtonLabel='Sign up'
            >
              <>
                {nameField}
                {usernameField}
                {emailAddressField}
                {phoneNumberField}
                {passwordField}
              </>
            </Form>
          </>
        )}
        <Footer>
          <SignInLink />
          <PoweredByClerk className='cl-auth-form-powered-by-clerk' />
        </Footer>
      </Body>
    </>
  );
}

export const SignUpContinue = withRedirectToHome(_SignUpContinue);
