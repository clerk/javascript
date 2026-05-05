import { useReverification } from '@clerk/shared/react';
import React from 'react';

import { Col, Flow, Heading, localizationKeys, Text } from '@/customizables';
import { useFieldOTP } from '@/elements/CodeControl';
import { useCardState } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { useRegisterContinueAction, useWizard } from '@/elements/Wizard';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSOFlow } from '../ConfigureSSOContext';
import { StepLayout } from './StepLayout';

export const VerifyDomain = (): JSX.Element => {
  const { goNext } = useWizard();
  const { primaryEmailAddress } = useConfigureSSOFlow();
  const card = useCardState();

  const prepareEmailVerification = useReverification(() =>
    primaryEmailAddress?.prepareVerification({ strategy: 'email_code' }),
  );
  const attemptEmailVerification = useReverification((code: string) =>
    primaryEmailAddress?.attemptVerification({ code }),
  );

  const prepare = React.useCallback(
    () => prepareEmailVerification()?.catch(err => handleError(err, [], card.setError)),
    [prepareEmailVerification, card],
  );

  const otp = useFieldOTP({
    onCodeEntryFinished: (code, resolve, reject) => {
      attemptEmailVerification(code)
        .then(() => resolve())
        .catch(reject);
    },
    onResendCodeClicked: () => {
      void prepare();
    },
    onResolve: () => {
      void goNext();
    },
  });

  // Send the first code on mount, and clear any stale card error that
  // could be lingering from a previous step
  React.useEffect(() => {
    void prepare();
    card.setError(undefined);
    return () => card.setError(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { values, length } = otp.otpControl.otpInputProps;
  const isCodeComplete = values.filter(Boolean).length === length;

  // The OTP auto-submits on the last digit — Continue is a fallback for
  // keyboard users / screen readers, so it tracks the same loading state
  // and stays disabled until every slot is filled
  useRegisterContinueAction({
    handler: otp.onFakeContinue,
    isDisabled: !isCodeComplete,
    isLoading: otp.isLoading,
  });

  return (
    <Flow.Part part='verifyDomain'>
      <StepLayout
        title='Verify email address'
        subtitle='Verify the email address you want to enable the enterprise connection on.'
      >
        <Col
          align='center'
          sx={t => ({
            flex: 1,
            justifyContent: 'center',
            gap: t.space.$5,
            paddingBlock: t.space.$8,
          })}
        >
          <Col sx={t => ({ gap: t.space.$1, textAlign: 'center' })}>
            <Heading
              textVariant='h1'
              sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}
            >
              Verify your email address
            </Heading>
            <Text
              as='p'
              variant='body'
              sx={t => ({ color: t.colors.$colorMutedForeground })}
            >
              Enter the verification code sent to {primaryEmailAddress?.emailAddress ?? ''}
            </Text>
          </Col>

          <Form.OTPInput
            {...otp}
            resendButton={localizationKeys('userProfile.emailAddressPage.emailCode.resendButton')}
          />
        </Col>
      </StepLayout>
    </Flow.Part>
  );
};
