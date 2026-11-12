import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import type { VerificationCodeResend } from '../../blocks/verification';
import { Card } from '../../components/card';
import { Flow } from '../../components/flow';
import type { MosaicMessages } from '../../localization';
import { fill, rich, useMessages } from '../../localization';
import { tabularNumbersStyle } from '../../styles/typography.styles';
import type { SignInFactor, SignInStep, SignInViewProps } from './sign-in.types';
import { codeCopy, codeIdentity, codeNotice, codeResendCopy, codeSecondaryAction, stepKey } from './sign-in.utils';
import { ChoiceStep } from './steps/choice-step';
import { CodeStep } from './steps/code-step';
import { CredentialStep } from './steps/credential-step';
import { IdentifierStep } from './steps/identifier-step';
import { NewPasswordStep } from './steps/new-password-step';
import { NoticeStep } from './steps/notice-step';
import { SignUpDetailsStep } from './steps/sign-up-details';

type Messages = MosaicMessages['signIn'];
type ResendCopy = Pick<Messages['emailCode'] | Messages['emailLink'], 'resendText' | 'resend' | 'resendCountdown'>;

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
  isDisabled,
  errorMessage,
  globalErrorMessage,
  newPasswordFeedback,
  onEditIdentifier,
  onSignUp,
  onForgotPassword,
  onCancel,
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
  const resendFor = (copy: ResendCopy): VerificationCodeResend | undefined =>
    onResend && {
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
      disabled: !canResend,
      onClick: onResend,
    };

  return (
    <Card.Root align='center'>
      <Flow.Root
        value={stepKey(step)}
        direction={direction}
        state={step}
      >
        {current => {
          const secondary = current.kind === 'code' ? codeSecondaryAction(current, m, { onCancel, onBack }) : undefined;
          return (
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
                  isDisabled={isDisabled}
                  onSubmit={onSubmit}
                  onSignUp={onSignUp}
                />
              </Flow.Step>

              <Flow.Step ids={['credential:password', 'credential:backup-code', 'credential:passkey']}>
                {current.kind === 'credential' ? (
                  <CredentialStep
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
                    onCancel={onCancel}
                    onShowHelp={onShowHelp}
                  />
                ) : null}
              </Flow.Step>

              <Flow.Step
                ids={[
                  'code:first-factor',
                  'code:second-factor',
                  'code:client-trust',
                  'code:sso-bypass',
                  'code:reset-password',
                  'code:verify-email',
                  'code:verify-phone',
                ]}
              >
                {current.kind === 'code' ? (
                  <CodeStep
                    focusRef={focusRef}
                    messages={{
                      ...codeCopy(current, m, applicationName),
                      ...actions,
                      secondaryActionLabel: secondary?.label ?? actions.secondaryActionLabel,
                      ...(current.purpose === 'reset-password'
                        ? { primaryActionLabel: m.resetPasswordCode.verify }
                        : {}),
                    }}
                    resend={resendFor(codeResendCopy(current, m))}
                    identity={codeIdentity(current, m)}
                    notice={codeNotice(current, m)}
                    form={form}
                    errorMessage={errorMessage}
                    globalErrorMessage={globalErrorMessage}
                    isPending={isPending}
                    onSubmit={onSubmit}
                    onCodeComplete={onCodeComplete}
                    onEditIdentifier={onEditIdentifier}
                    onCancel={secondary?.onClick}
                  />
                ) : null}
              </Flow.Step>

              <Flow.Step ids={['choice:methods', 'choice:reset-methods', 'choice:enterprise-connections']}>
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
                    logo={applicationLogoUrl ? { src: applicationLogoUrl, alt: applicationName } : undefined}
                    globalErrorMessage={globalErrorMessage}
                    pendingProviderId={pendingProviderId}
                    onSelectProvider={onSelectProvider}
                    onCancel={onCancel}
                  />
                ) : null}
              </Flow.Step>

              <Flow.Step
                ids={[
                  'notice:help',
                  'notice:forgot-password',
                  'notice:no-methods',
                  'notice:action-blocked',
                  'notice:password-compromised',
                  'notice:enterprise-sso',
                  'notice:email-link',
                ]}
              >
                {current.kind === 'notice' ? (
                  <NoticeStep
                    focusRef={focusRef}
                    step={current}
                    applicationName={applicationName}
                    logo={applicationLogoUrl ? { src: applicationLogoUrl, alt: applicationName } : undefined}
                    globalErrorMessage={globalErrorMessage}
                    isPending={isPending}
                    resend={current.purpose === 'email-link' ? resendFor(m.emailLink) : undefined}
                    onSubmit={() => onSubmit()}
                    onEmailSupport={onEmailSupport}
                    onBack={onBack}
                    onEditIdentifier={onEditIdentifier}
                    onForgotPassword={onForgotPassword}
                    onCancel={onCancel}
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
          );
        }}
      </Flow.Root>
    </Card.Root>
  );
}
