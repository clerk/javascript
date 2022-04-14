// @ts-ignore
import { default as MailIcon } from '@clerk/shared/assets/icons/mail.svg';
import { Button } from '@clerk/shared/components/button';
import { Control } from '@clerk/shared/components/control';
import { Form } from '@clerk/shared/components/form';
import { InputWithIcon } from '@clerk/shared/components/input';
import { TitledCard } from '@clerk/shared/components/titledCard';
import { EmailAddressResource } from '@clerk/types';
import React from 'react';
import { handleError, useFieldState } from 'ui/common';
import { Error } from 'ui/common/error';
import { useCoreUser, useEnvironment } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { EmailAddressVerificationWithMagicLink } from 'ui/userProfile/emailAdressess/EmailAddressVerificationWithMagicLink';
import { EmailAddressVerificationWithOTP } from 'ui/userProfile/emailAdressess/EmailAddressVerificationWithOTP';
import { magicLinksEnabledForInstance } from 'ui/userProfile/emailAdressess/utils';
import { PageHeading } from 'ui/userProfile/pageHeading';

enum Step {
  EnterEmailAddress = 0,
  VerifyEmailAddress = 1,
  Finish = 2,
}

const stepSubtitleMap = {
  [Step.EnterEmailAddress]: 'Enter an email address to add',
  [Step.VerifyEmailAddress]: 'Verify the email address',
  [Step.Finish]: 'Email address successfully added',
};

export function AddNewEmail(): JSX.Element {
  const user = useCoreUser();
  const { navigate } = useNavigate();
  const environment = useEnvironment();
  const [step, setStep] = React.useState<Step>(Step.EnterEmailAddress);
  const [error, setError] = React.useState<string | undefined>();
  const createdEmailRef = React.useRef<EmailAddressResource>();
  const emailValue = useFieldState('email_address', '');

  const magicLinksEnabled = magicLinksEnabledForInstance(environment);
  const nextStep = () => setStep(s => s + 1);
  const navigateBack = () => navigate('../');
  const navigateToCreatedEmailAddress = () => {
    if (createdEmailRef.current) {
      navigate(`../${createdEmailRef.current.id}`);
    }
  };

  const createEmailAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    return user
      .createEmailAddress({ email: emailValue.value })
      .then(res => {
        createdEmailRef.current = res;
        nextStep();
      })
      .catch(e => handleError(e, [emailValue], setError));
  };

  const onErrorHandler = (e: any) => {
    handleError(e, [emailValue], setError);
  };

  const onVerificationCompleteHandler = () => {
    nextStep();
  };

  const enterEmailForm = step === Step.EnterEmailAddress && (
    <Form
      handleSubmit={createEmailAddress}
      submitButtonLabel={magicLinksEnabled ? 'Send magic link' : 'Send code'}
      handleReset={navigateBack}
      resetButtonLabel='Cancel'
      buttonGroupClassName='cl-form-button-group'
    >
      <Control
        label='Email address'
        error={emailValue.error}
        htmlFor='email_address_input'
      >
        <InputWithIcon
          Icon={<MailIcon viewBox='0 0 24 24' />}
          type='email'
          id='email_address_input'
          name='email_address_input'
          value={emailValue.value}
          handleChange={el => emailValue.setValue(el.value || '')}
          autoFocus
          autoComplete='off'
          required
          minLength={1}
          maxLength={255}
        />
      </Control>
      <div className='cl-copy-text'>
        An email containing a {magicLinksEnabled ? 'magic link' : 'verification code'} will be sent to your email
        address.
      </div>
    </Form>
  );

  const verifyEmailScreen =
    step === Step.VerifyEmailAddress &&
    createdEmailRef.current &&
    (magicLinksEnabled ? (
      <EmailAddressVerificationWithMagicLink
        email={createdEmailRef.current}
        onError={onErrorHandler}
        onVerificationComplete={onVerificationCompleteHandler}
      />
    ) : (
      <EmailAddressVerificationWithOTP
        email={createdEmailRef.current}
        onError={onErrorHandler}
        onVerificationComplete={onVerificationCompleteHandler}
      />
    ));

  const finishScreen = step === Step.Finish && (
    <>
      <div className='cl-copy-text'>
        <span className='cl-identifier'>{emailValue.value} has successfully been added to your account.</span>
      </div>
      <div className='cl-form-button-group'>
        <Button onClick={navigateToCreatedEmailAddress}>Finish</Button>
      </div>
    </>
  );

  const title = magicLinksEnabled && step === Step.VerifyEmailAddress ? undefined : 'Add email';

  const subtitle = magicLinksEnabled && step === Step.VerifyEmailAddress ? undefined : stepSubtitleMap[step];

  return (
    <>
      <PageHeading
        title='Back'
        backTo='../'
      />
      <TitledCard
        title={title}
        subtitle={subtitle}
        className='cl-themed-card cl-verifiable-field-card'
      >
        <Error>{error}</Error>
        {enterEmailForm}
        {verifyEmailScreen}
        {finishScreen}
      </TitledCard>
    </>
  );
}
