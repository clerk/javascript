import { Control } from '@clerk/shared/components/control';
import { Form } from '@clerk/shared/components/form';
import { Input } from '@clerk/shared/components/input';
import { PhoneInput } from '@clerk/shared/components/phoneInput';
import { noop } from '@clerk/shared/utils';
import { SignUpCreateParams, SignUpResource } from '@clerk/types';
import React from 'react';
import type { FieldState } from 'ui/common';
import {
  buildRequest,
  Footer,
  handleError,
  LoadingScreen,
  PoweredByClerk,
  Separator,
  useFieldState,
  withRedirectToHome,
} from 'ui/common';
import { Body, Header } from 'ui/common/authForms';
import { ERROR_CODES } from 'ui/common/constants';
import {
  useCoreClerk,
  useCoreSignUp,
  useEnvironment,
  useSignUpContext,
} from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { getClerkQueryParam } from 'utils/getClerkQueryParam';

import { SignInLink } from './SignInLink';
import { SignUpOAuth } from './SignUpOAuth';
import { SignUpWeb3 } from './SignUpWeb3';
import { determineFirstPartyFields } from './utils';

type ActiveIdentifier = 'emailAddress' | 'phoneNumber';

function _SignUpStart(): JSX.Element {
  const { navigate } = useNavigate();
  const environment = useEnvironment();
  const { userSettings } = environment;
  const { setSession } = useCoreClerk();
  const { navigateAfterSignUp } = useSignUpContext();
  const [emailOrPhoneActive, setEmailOrPhoneActive] =
    React.useState<ActiveIdentifier>('emailAddress');
  const signUp = useCoreSignUp();
  const [isLoading, setIsLoading] = React.useState(false);
  const formFields = {
    firstName: useFieldState('first_name', ''),
    lastName: useFieldState('last_name', ''),
    emailAddress: useFieldState('email_address', ''),
    username: useFieldState('username', ''),
    phoneNumber: useFieldState('phone_number', ''),
    password: useFieldState('password', ''),
    ticket: useFieldState(
      'ticket',
      getClerkQueryParam('__clerk_ticket') ||
        getClerkQueryParam('__clerk_invitation_token') ||
        '',
    ),
  } as const;
  type FormFieldsKey = keyof typeof formFields;

  const [error, setError] = React.useState<string | undefined>();
  const hasTicket = !!formFields.ticket.value;

  const fields = determineFirstPartyFields(environment, hasTicket);
  const oauthOptions = userSettings.socialProviderStrategies;
  const web3Options = userSettings.web3FirstFactors;

  const handleTokenFlow = () => {
    const ticket = formFields.ticket.value;
    if (!ticket) {
      return;
    }
    const signUpParams: SignUpCreateParams = { strategy: 'ticket', ticket };
    setIsLoading(true);

    signUp
      .create(signUpParams)
      .then(res => {
        formFields.emailAddress.setValue(res.emailAddress || '');
        void completeSignUpFlow(res);
      })
      .catch(err => {
        /* Clear ticket values when an error occurs in the initial sign up attempt */
        formFields.ticket.setValue('');
        handleError(err, [], setError);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  React.useLayoutEffect(() => {
    if (Object.values(fields).filter(f => f === 'on').length) {
      return;
    }
    void handleTokenFlow();
  }, []);

  React.useEffect(() => {
    async function handleOauthError() {
      const error = signUp.verifications.externalAccount.error;

      if (
        error?.code === ERROR_CODES.NOT_ALLOWED_TO_SIGN_UP ||
        error?.code === ERROR_CODES.OAUTH_ACCESS_DENIED
      ) {
        setError(error.longMessage);

        // TODO: This is a hack to reset the sign in attempt so that the oauth error
        // does not persist on full page reloads.
        //
        // We will revise this strategy as part of the Clerk DX epic.
        void (await signUp.create({}));
      }
    }

    void handleOauthError();
  });

  const handleChangeActive =
    (type: ActiveIdentifier) => (e: React.MouseEvent) => {
      e.preventDefault();
      if (!fields.emailOrPhone) {
        return;
      }
      setEmailOrPhoneActive(type);
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const reqFields = Object.entries(fields).reduce(
      (acc, [k, v]) => [
        ...acc,
        ...(v && formFields[k as FormFieldsKey]
          ? [formFields[k as FormFieldsKey]]
          : []),
      ],
      [] as Array<FieldState<any>>,
    );

    if (fields.emailOrPhone && emailOrPhoneActive === 'emailAddress') {
      reqFields.push(formFields.emailAddress);
    }

    if (fields.emailOrPhone && emailOrPhoneActive === 'phoneNumber') {
      reqFields.push(formFields.phoneNumber);
    }

    if (fields.ticket) {
      // FIXME: Constructing a fake fields object for strategy.
      reqFields.push({
        name: 'strategy',
        value: 'ticket',
        setError: noop,
        setValue: noop,
        error: undefined,
      });
    }

    try {
      setError(undefined);
      const res = await signUp.create(buildRequest(reqFields));
      return completeSignUpFlow(res);
    } catch (err) {
      handleError(err, reqFields, setError);
    }
  };

  const completeSignUpFlow = (su: SignUpResource) => {
    if (su.status === 'complete') {
      return setSession(su.createdSessionId, navigateAfterSignUp);
    } else if (
      su.emailAddress &&
      su.verifications.emailAddress.status !== 'verified'
    ) {
      return navigate('verify-email-address');
    } else if (
      su.phoneNumber &&
      su.verifications.phoneNumber.status !== 'verified'
    ) {
      return navigate('verify-phone-number');
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

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
    (hasTicket && !!formFields.emailAddress.value) ||
    fields.emailAddress ||
    (fields.emailOrPhone && emailOrPhoneActive === 'emailAddress');

  const disabledEmailField = hasTicket && !!formFields.emailAddress.value;

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
        disabled={disabledEmailField}
      />
    </Control>
  );

  const phoneNumberField =
    fields.phoneNumber ||
    (fields.emailOrPhone && emailOrPhoneActive === 'phoneNumber') ? (
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

  const atLeastOneFormField =
    nameField ||
    usernameField ||
    emailAddressField ||
    phoneNumberField ||
    passwordField;

  return (
    <>
      <Header error={error} className='cl-auth-form-header-compact' />
      <Body>
        {!hasTicket && oauthOptions.length > 0 && (
          <SignUpOAuth oauthOptions={oauthOptions} setError={setError} />
        )}
        {!hasTicket && web3Options.length > 0 && (
          <SignUpWeb3 web3Options={web3Options} setError={setError} />
        )}
        {atLeastOneFormField && (
          <>
            {(oauthOptions.length > 0 || web3Options.length > 0) && (
              <Separator />
            )}
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

export const SignUpStart = withRedirectToHome(_SignUpStart);
