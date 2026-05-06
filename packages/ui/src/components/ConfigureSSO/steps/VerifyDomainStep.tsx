import { useReverification, useUser } from '@clerk/shared/react';
import React from 'react';

import { Col, Flow, Heading, Icon, Input, localizationKeys, Text, useLocalizations } from '@/customizables';
import { useFieldOTP } from '@/elements/CodeControl';
import { useCardState } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { DuotoneAtSymbol } from '@/icons';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSOWizard, useRegisterContinueAction } from '../wizard';
import { StepLayout } from './StepLayout';

export const VerifyDomainStep = (): JSX.Element | null => {
  const { goNext, goToStep } = useConfigureSSOWizard();
  const card = useCardState();
  const { t } = useLocalizations();
  const { user } = useUser();

  const emailToVerify =
    user?.primaryEmailAddress ?? user?.emailAddresses?.find(e => e.verification.status !== 'verified');
  const isVerified = emailToVerify?.verification.status === 'verified';
  const isAlreadyPrimary = Boolean(emailToVerify && emailToVerify.id === user?.primaryEmailAddressId);

  const prepareEmailVerification = useReverification(() =>
    emailToVerify?.prepareVerification({ strategy: 'email_code' }),
  );
  const attemptEmailVerification = useReverification((code: string) => emailToVerify?.attemptVerification({ code }));
  const setPrimaryEmailAddress = useReverification((emailAddressId: string) =>
    user?.update({ primaryEmailAddressId: emailAddressId }),
  );

  const prepare = React.useCallback(
    () => prepareEmailVerification()?.catch(err => handleError(err, [], card.setError)),
    [prepareEmailVerification, card],
  );

  const codeSubmittedRef = React.useRef(false);

  const otp = useFieldOTP({
    onCodeEntryFinished: (code, resolve, reject) => {
      codeSubmittedRef.current = true;
      attemptEmailVerification(code)
        .then(() => resolve())
        .catch(reject);
    },
    onResendCodeClicked: () => {
      void prepare();
    },
    onResolve: async () => {
      if (emailToVerify && !isAlreadyPrimary) {
        try {
          await setPrimaryEmailAddress(emailToVerify.id);
        } catch (err) {
          handleError(err as Error, [], card.setError);
          return;
        }
      }
      void goNext();
    },
  });

  const { values, length } = otp.otpControl.otpInputProps;
  const isCodeComplete = values.filter(Boolean).length === length;
  const showVerifiedView = isVerified && !codeSubmittedRef.current;

  useRegisterContinueAction(
    showVerifiedView
      ? {
          handler: () => {
            void goNext();
          },
        }
      : {
          handler: otp.onFakeContinue,
          isDisabled: !isCodeComplete,
          isLoading: otp.isLoading,
        },
  );

  React.useEffect(() => {
    if (!emailToVerify) {
      void goToStep('provide-email');
    }
  }, [emailToVerify, goToStep]);

  // Send the first code on mount (only when there's something to verify),
  // and clear any stale card error that could be lingering from a previous step
  React.useEffect(() => {
    if (emailToVerify && !isVerified) {
      void prepare();
    }
    card.setError(undefined);
    return () => card.setError(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!emailToVerify) {
    return null;
  }

  return (
    <Flow.Part part='verifyDomain'>
      <StepLayout
        title={localizationKeys('configureSSO.verifyEmailDomainStep.title')}
        subtitle={localizationKeys('configureSSO.verifyEmailDomainStep.subtitle')}
      >
        <Col
          align='center'
          sx={t => ({
            flex: 1,
            justifyContent: 'center',
            gap: t.space.$2,
            paddingBlock: t.space.$8,
          })}
        >
          {showVerifiedView ? (
            <>
              <Icon
                icon={DuotoneAtSymbol}
                sx={t => ({
                  width: t.sizes.$8,
                  height: t.sizes.$8,
                  color: t.colors.$neutralAlpha600,
                })}
              />
              <Col sx={t => ({ gap: t.space.$1, textAlign: 'center', maxWidth: t.sizes.$66 })}>
                <Heading
                  textVariant='h1'
                  sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}
                  localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.emailCode.verified.title')}
                />
                <Text
                  as='p'
                  variant='body'
                  sx={t => ({ color: t.colors.$colorMutedForeground })}
                  localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.emailCode.verified.subtitle')}
                />
              </Col>
              <Input
                type='email'
                value={emailToVerify.emailAddress}
                readOnly
                aria-label={t(localizationKeys('configureSSO.verifyEmailDomainStep.emailCode.verified.inputLabel'))}
                sx={t => ({ width: '100%', maxWidth: t.sizes.$66, backgroundColor: t.colors.$neutralAlpha50 })}
              />
            </>
          ) : (
            <>
              <Col sx={t => ({ gap: t.space.$1, textAlign: 'center' })}>
                <Heading
                  textVariant='h1'
                  sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}
                  localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.emailCode.formTitle')}
                />
                <Text
                  as='p'
                  variant='body'
                  sx={t => ({ color: t.colors.$colorMutedForeground })}
                  localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.emailCode.formSubtitle', {
                    identifier: emailToVerify.emailAddress,
                  })}
                />
              </Col>
              <Form.OTPInput
                {...otp}
                resendButton={localizationKeys('configureSSO.verifyEmailDomainStep.emailCode.resendButton')}
              />
            </>
          )}
        </Col>
      </StepLayout>
    </Flow.Part>
  );
};
