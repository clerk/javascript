import { Button } from '@clerk/shared/components/button';
import { Control } from '@clerk/shared/components/control';
import { Form } from '@clerk/shared/components/form';
import { InputWithIcon } from '@clerk/shared/components/input';
import { OneTimeCodeInput, VerifyCodeHandler } from '@clerk/shared/components/oneTimeCodeInput';
import { PhoneInput, PhoneViewer } from '@clerk/shared/components/phoneInput';
import { TitledCard } from '@clerk/shared/components/titledCard';
import { Wizard } from '@clerk/shared/components/wizard';
import { VerificationResource } from '@clerk/types';
import React from 'react';
import { handleError, useFieldState, verificationErrorMessage } from 'ui/common';
import { Error } from 'ui/common/error';
import { useNavigate } from 'ui/hooks';
import { PageHeading } from 'ui/userProfile/pageHeading';

export interface ListValue {
  id: string;
  verification: VerificationResource | null;
  toString: () => string;
  destroy: () => Promise<any>;
  prepareVerification: () => Promise<any>;
  attemptVerification: (params: { code: string }) => Promise<any>;
}

interface AddVerifiableFieldProps {
  type: 'email' | 'phone';
  label: string;
  inputIcon?: React.ReactNode;
  stepTitle: Record<number, string>;
  stepText: Record<number, React.ReactNode>;
  slug: string;
  onAdd: (value: string) => Promise<ListValue>;
}

export function AddVerifiableField({
  label,
  slug,
  onAdd,
  stepText,
  stepTitle,
  inputIcon,
  type,
}: AddVerifiableFieldProps): JSX.Element {
  const inputName = `${label.replace(/\s/g, '_').toLowerCase()}_input`;
  const [state, setState] = React.useState<{
    step: number;
    listVal: ListValue | null;
  }>({
    listVal: null,
    step: 0,
  });
  const currentValue = useFieldState(slug, '');
  const code = useFieldState('code', '');
  const [error, setError] = React.useState<string | undefined>();
  const { navigate } = useNavigate();

  React.useEffect(() => {
    currentValue.setError(undefined);
    setError(undefined);
  }, [currentValue.value]);

  const updateFieldSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const listVal = await onAdd(currentValue.value);
      await listVal.prepareVerification();
      setState(currentState => ({ ...currentState, listVal, step: 1 }));
    } catch (err) {
      handleError(err, [currentValue], setError);
    }
  };

  const sendVerificationCode = () => {
    if (!state.listVal) {
      return;
    }
    // state.listVal.prepareVerification();
  };

  const verifyCode: VerifyCodeHandler = async (verify, reject) => {
    try {
      await state.listVal?.attemptVerification({ code: code.value });
      verify(() => setState(s => ({ ...s, step: s.step + 1 })));
    } catch (err) {
      reject(verificationErrorMessage(err));
    }
  };

  const onFinish = () => {
    if (!state.listVal) {
      return;
    }
    navigate(`../${state.listVal.id}`);
  };

  const onBack = () => navigate('../');

  const step1EnterValue = (
    <Form
      handleSubmit={updateFieldSubmit}
      submitButtonLabel='Send code'
      handleReset={onBack}
      resetButtonLabel='Cancel'
      buttonGroupClassName='cl-form-button-group'
    >
      <Control label={label} error={currentValue.error} htmlFor={inputName}>
        {type === 'phone' ? (
          <div className='cl-phone-input-container'>
            <PhoneInput handlePhoneChange={currentValue.setValue} name={inputName} id={inputName} />
          </div>
        ) : (
          <>
            <InputWithIcon
              Icon={inputIcon}
              type={type}
              id={inputName}
              name={inputName}
              value={currentValue.value}
              handleChange={el => currentValue.setValue(el.value || '')}
              autoFocus
              autoComplete='off'
              required
              minLength={1}
              maxLength={255}
            />
          </>
        )}
      </Control>
      <div className='cl-copy-text'>{stepText[state.step]}</div>
    </Form>
  );

  const step2Verify = (
    <>
      <div className='cl-copy-text' style={{ marginBottom: '2em' }}>
        {stepText[state.step] + ' '}
        {type === 'phone' ? (
          <PhoneViewer className='cl-identifier' phoneNumber={currentValue.value} />
        ) : (
          <span className='cl-identifier'>{currentValue.value}</span>
        )}
        .
      </div>
      <OneTimeCodeInput
        value={code.value}
        setValue={code.setValue}
        verifyCodeHandler={verifyCode}
        onResendCode={sendVerificationCode}
        className='cl-otp-input'
      />
    </>
  );

  const step3Finish = (
    <>
      <div className='cl-copy-text'>
        {type === 'phone' ? (
          <PhoneViewer phoneNumber={currentValue.value} className='cl-identifier' />
        ) : (
          <span className='cl-identifier'>{currentValue.value}</span>
        )}{' '}
        {stepText[state.step]}
      </div>
      <div className='cl-form-button-group'>
        <Button onClick={onFinish}>Finish</Button>
      </div>
    </>
  );

  return (
    <>
      <PageHeading title='Back' backTo='../' />
      <TitledCard
        title={`Add ${type}`}
        subtitle={stepTitle[state.step]}
        className='cl-themed-card cl-verifiable-field-card'
      >
        <Error>{error}</Error>
        <Wizard defaultStep={state.step}>
          {step1EnterValue}
          {step2Verify}
          {step3Finish}
        </Wizard>
      </TitledCard>
    </>
  );
}
