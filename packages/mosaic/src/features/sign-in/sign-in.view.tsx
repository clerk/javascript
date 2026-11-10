import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import type { VerificationCodeMessages, VerificationCodeResend } from '../../blocks/verification';
import { Card } from '../../components/card';
import { Flow } from '../../components/flow';
import type { MosaicMessages } from '../../localization';
import { fill, rich, useMessages } from '../../localization';
import { tabularNumbersStyle } from '../../styles/typography.styles';
import type { SignInFactor, SignInStep, SignInViewProps } from './sign-in.types';
import { stepKey } from './sign-in.utils';
import { ChoiceStep } from './steps/choice-step';
import { CodeStep } from './steps/code-step';
import { IdentifierStep } from './steps/identifier-step';
import { NewPasswordStep } from './steps/new-password-step';
import { NoticeStep } from './steps/notice-step';
import { SecretStep } from './steps/secret-step';
import { SignUpDetailsStep } from './steps/sign-up-details';

type Messages = MosaicMessages['signIn'];
type CodeStepData = Extract<SignInStep, { kind: 'code' }>;
type ResendCopy = Pick<Messages['emailCode'], 'resendText' | 'resend' | 'resendCountdown'>;

function factorLabel(factor: SignInFactor, m: Messages): string {
  switch (factor.strategy) {
    case 'password':
      return m.alternativeMethods.password;
    case 'passkey':
      return m.alternativeMethods.passkey;
    case 'email_code':
      return fill(m.alternativeMethods.emailCode, { identifier: factor.identifier });
    case 'phone_code':
      return fill(m.alternativeMethods.phoneCode, { identifier: factor.identifier });
    case 'totp':
      return m.alternativeMethods.totp;
    case 'backup_code':
      return m.alternativeMethods.backupCode;
    case 'reset_password_email_code':
      return fill(m.resetMethods.emailCode, { identifier: factor.identifier });
    case 'reset_password_phone_code':
      return fill(m.resetMethods.phoneCode, { identifier: factor.identifier });
  }
}

function choiceCopy(
  step: Extract<SignInStep, { kind: 'choice' }>,
  m: Messages,
): { title: string; description: string } {
  return step.purpose === 'reset-methods'
    ? { title: m.resetMethods.title, description: m.resetMethods.description }
    : { title: m.alternativeMethods.title, description: m.alternativeMethods.description };
}

function resendCopy(step: CodeStepData, m: Messages): ResendCopy | undefined {
  if (step.purpose === 'reset-password') {
    return m.resetPasswordCode;
  }
  if (step.purpose === 'verify-email') {
    return m.verifyEmail;
  }
  if (step.channel === 'totp') {
    return undefined;
  }
  if (step.channel === 'phone') {
    return step.purpose === 'second-factor' ? m.phoneCodeMfa : m.phoneCode;
  }
  return m.emailCode;
}

function codeCopy(
  step: CodeStepData,
  m: Messages,
): Pick<VerificationCodeMessages, 'title' | 'description' | 'fieldLabel'> {
  const identifier = step.identifier ?? '';
  if (step.purpose === 'reset-password') {
    const description =
      step.channel === 'phone' ? m.resetPasswordCode.descriptionPhone : m.resetPasswordCode.descriptionEmail;
    return {
      title: m.resetPasswordCode.title,
      description: fill(description, { identifier }),
      fieldLabel: m.resetPasswordCode.label,
    };
  }
  if (step.purpose === 'verify-email') {
    return {
      title: m.verifyEmail.title,
      description: fill(m.verifyEmail.description, { identifier }),
      fieldLabel: m.verifyEmail.label,
    };
  }
  if (step.channel === 'totp') {
    return { title: m.totpMfa.title, description: m.totpMfa.description, fieldLabel: m.totpMfa.label };
  }
  if (step.channel === 'phone') {
    const copy = step.purpose === 'second-factor' ? m.phoneCodeMfa : m.phoneCode;
    return { title: copy.title, description: fill(copy.description, { identifier }), fieldLabel: copy.label };
  }
  return {
    title: m.emailCode.title,
    description: fill(m.emailCode.description, { identifier }),
    fieldLabel: m.emailCode.label,
  };
}

export function SignInView({
  step,
  direction,
  applicationName,
  applicationLogoUrl,
  combined,
  socialProviders,
  pendingProviderId,
  onSelectProvider,
  form,
  onSubmit,
  onCodeComplete,
  isPending,
  errorMessage,
  globalErrorMessage,
  newPasswordFeedback,
  onEditIdentifier,
  onSignUp,
  onForgotPassword,
  onShowMethods,
  onShowHelp,
  onBack,
  onEmailSupport,
  pendingFactorId,
  onSelectFactor,
  onResend,
  canResend,
  resendRemainingSeconds,
  focusRef,
}: SignInViewProps & { focusRef?: Ref<HTMLElement> }) {
  const m = useMessages('signIn');

  const actions = {
    secondaryActionLabel: m.useAnotherMethod,
    primaryActionLabel: m.continue,
    pendingLabel: m.verifying,
  };
  const resendFor = (copy: ResendCopy | undefined): VerificationCodeResend | undefined =>
    copy && {
      text: copy.resendText,
      label: resendRemainingSeconds ? (
        <span>
          {rich(copy.resendCountdown, {
            values: {
              seconds: <span {...stylex.props(tabularNumbersStyle.enabled)}>{resendRemainingSeconds}</span>,
            },
          })}
        </span>
      ) : (
        copy.resend
      ),
      // TODO: Take this flag from the controller instead of deriving it from canResend and isPending.
      disabled: !canResend || isPending,
      onClick: onResend,
    };

  return (
    <Card.Root align='center'>
      <Flow.Root
        value={stepKey(step)}
        direction={direction}
        state={step}
      >
        {current => (
          <>
            <Flow.Step ids={['identifier']}>
              <IdentifierStep
                focusRef={focusRef}
                logo={applicationLogoUrl ? { src: applicationLogoUrl, alt: applicationName } : undefined}
                applicationName={applicationName}
                combined={combined}
                socialProviders={socialProviders}
                pendingProviderId={pendingProviderId}
                onSelectProvider={onSelectProvider}
                form={form}
                errorMessage={errorMessage}
                globalErrorMessage={globalErrorMessage}
                isPending={isPending}
                onSubmit={onSubmit}
                // TODO: Have the controller omit onSignUp in the combined flow instead of the view dropping it.
                onSignUp={combined ? undefined : onSignUp}
              />
            </Flow.Step>

            <Flow.Step ids={['secret:password', 'secret:backup-code']}>
              {current.kind === 'secret' ? (
                <SecretStep
                  focusRef={focusRef}
                  step={current}
                  messages={{
                    title: m.backupCodeMfa.title,
                    description: m.backupCodeMfa.description,
                    fieldLabel: m.backupCodeMfa.label,
                    ...actions,
                  }}
                  form={form}
                  errorMessage={errorMessage}
                  globalErrorMessage={globalErrorMessage}
                  isPending={isPending}
                  onSubmit={onSubmit}
                  onEditIdentifier={onEditIdentifier}
                  onForgotPassword={onForgotPassword}
                  onShowMethods={onShowMethods}
                />
              ) : null}
            </Flow.Step>

            <Flow.Step ids={['code:first-factor', 'code:second-factor', 'code:reset-password', 'code:verify-email']}>
              {current.kind === 'code' ? (
                <CodeStep
                  focusRef={focusRef}
                  step={current}
                  messages={{
                    ...codeCopy(current, m),
                    ...actions,
                    ...(current.purpose === 'reset-password'
                      ? {
                          primaryActionLabel: m.resetPasswordCode.verify,
                          secondaryActionLabel: m.forgotPassword.back,
                        }
                      : {}),
                  }}
                  resend={resendFor(resendCopy(current, m))}
                  form={form}
                  errorMessage={errorMessage}
                  globalErrorMessage={globalErrorMessage}
                  isPending={isPending}
                  onSubmit={onSubmit}
                  onCodeComplete={onCodeComplete}
                  onShowMethods={onShowMethods}
                  onBack={onBack}
                />
              ) : null}
            </Flow.Step>

            <Flow.Step ids={['choice:methods', 'choice:reset-methods']}>
              {current.kind === 'choice' ? (
                <ChoiceStep
                  focusRef={focusRef}
                  step={current}
                  messages={{
                    ...choiceCopy(current, m),
                    backButton: m.back,
                    helpText: m.alternativeMethods.helpPrompt,
                    helpButton: m.alternativeMethods.helpLink,
                  }}
                  factorLabel={factor => factorLabel(factor, m)}
                  pendingFactorId={pendingFactorId}
                  onSelectFactor={onSelectFactor}
                  onShowHelp={onShowHelp}
                  onBack={onBack}
                />
              ) : null}
            </Flow.Step>

            <Flow.Step ids={['notice:help', 'notice:forgot-password']}>
              {current.kind === 'notice' ? (
                <NoticeStep
                  focusRef={focusRef}
                  step={current}
                  messages={{
                    title: m.alternativeMethods.getHelp.title,
                    description: m.alternativeMethods.getHelp.description,
                    backButton: m.back,
                    supportButton: m.alternativeMethods.getHelp.emailSupport,
                  }}
                  globalErrorMessage={globalErrorMessage}
                  isPending={isPending}
                  onSubmit={() => onSubmit()}
                  onEmailSupport={onEmailSupport}
                  onBack={onBack}
                />
              ) : null}
            </Flow.Step>

            <Flow.Step ids={['new-password:forgot']}>
              <NewPasswordStep
                focusRef={focusRef}
                form={form}
                isPending={isPending}
                onSubmit={onSubmit}
                passwordFeedback={newPasswordFeedback}
                onBack={onBack}
              />
            </Flow.Step>

            <Flow.Step ids={['sign-up']}>
              <SignUpDetailsStep
                focusRef={focusRef}
                form={form}
                globalErrorMessage={globalErrorMessage}
                isPending={isPending}
                onSubmit={onSubmit}
                onSignIn={onEditIdentifier}
              />
            </Flow.Step>
          </>
        )}
      </Flow.Root>
    </Card.Root>
  );
}
