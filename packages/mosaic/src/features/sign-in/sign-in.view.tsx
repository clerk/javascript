import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import type { VerificationCodeResend } from '../../blocks/verification';
import { VerificationCode } from '../../blocks/verification';
import { Card } from '../../components/card';
import { Flow } from '../../components/flow';
import type { MosaicMessages } from '../../localization';
import { fill, rich, useMessages } from '../../localization';
import { tabularNumbersStyle } from '../../styles/typography.styles';
import { codeCopy, codeIdentity, codeNotice, codeResendCopy, codeSecondaryAction } from '../auth-flow/auth-flow.utils';
import { IdentityPreview } from '../auth-flow/steps/identity-preview';
import { SignUpDetailsStep } from '../sign-up/steps/sign-up-details';
import type { SignInFactor, SignInStep, SignInViewProps } from './sign-in.types';
import { backupCodeDescription, stepIds, stepKey } from './sign-in.utils';
import { ChoiceStep } from './steps/choice-step';
import { CredentialStep } from './steps/credential-step';
import { IdentifierStep } from './steps/identifier-step';
import { NewPasswordStep } from './steps/new-password-step';
import { NoticeStep } from './steps/notice-step';

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
    case 'email_link':
      return fill(m.alternativeMethods.emailLink, { identifier: factor.identifier });
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

function backupCodeMessage(step: Extract<SignInStep, { kind: 'credential' }>, m: Messages): string {
  return step.credential === 'backup-code' ? backupCodeDescription(step, m) : m.backupCodeMfa.description;
}

function choiceCopy(
  step: Extract<SignInStep, { kind: 'choice' }>,
  m: Messages,
): { title: string; description: string } {
  return step.purpose === 'reset-methods'
    ? { title: m.resetMethods.title, description: m.resetMethods.description }
    : { title: m.alternativeMethods.title, description: m.alternativeMethods.description };
}

function signUpSignIn(step: Extract<SignInStep, { kind: 'sign-up' }>, onSignIn: () => void) {
  return step.purpose === 'continue' ? undefined : onSignIn;
}

export function SignInView({
  step,
  direction,
  applicationName,
  applicationLogoUrl,
  combined,
  socialProviders,
  pendingProviderId,
  lastUsedProviderId,
  onSelectProvider,
  onPasskey,
  form,
  onSubmit,
  onCodeComplete,
  isPending,
  isDisabled,
  errorMessage,
  globalErrorMessage,
  newPasswordFeedback,
  onEditIdentifier,
  onSwitchField,
  onSignUp,
  onJoinWaitlist,
  onForgotPassword,
  onCancel,
  onShowHelp,
  onBack,
  onStartOver,
  onRetry,
  protectCheckRef,
  onEmailSupport,
  pendingFactorId,
  onSelectFactor,
  pendingAccountId,
  onSelectAccount,
  onAddAccount,
  onSignOutAll,
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

  const logo = applicationLogoUrl ? { src: applicationLogoUrl, alt: applicationName } : undefined;
  const code = form.registerValue('code');

  const codeStep = (current: Extract<SignInStep, { kind: 'code' }>) => {
    const secondary = codeSecondaryAction(current, m, { onCancel, onBack });
    const identity = codeIdentity(current, m);
    return (
      <VerificationCode
        focusRef={focusRef}
        messages={{
          ...codeCopy(current, m, applicationName),
          ...actions,
          secondaryActionLabel: secondary.label,
          ...(current.purpose === 'reset-password' ? { primaryActionLabel: m.resetPasswordCode.verify } : {}),
        }}
        resend={resendFor(codeResendCopy(current, m))}
        identity={
          identity.identifier ? (
            <IdentityPreview
              identifier={identity.identifier}
              editLabel={identity.editLabel}
              disabled={isPending}
              onEdit={onEditIdentifier}
            />
          ) : undefined
        }
        notice={codeNotice(current, m)}
        value={code.value}
        onValueChange={code.onValueChange}
        errorMessage={errorMessage}
        globalErrorMessage={globalErrorMessage}
        isPending={isPending}
        onSubmit={() => onSubmit()}
        onComplete={onCodeComplete}
        onCancel={secondary.onClick}
      />
    );
  };

  return (
    <Card.Root align='center'>
      <Flow.Root
        value={stepKey(step)}
        direction={direction}
        state={step}
      >
        {current => {
          const identifierStep =
            current.kind === 'identifier' ? (
              <IdentifierStep
                step={current}
                onCancel={onCancel}
                onSwitchField={onSwitchField}
                onForgotPassword={onForgotPassword}
                focusRef={focusRef}
                logo={logo}
                applicationName={applicationName}
                combined={combined}
                socialProviders={socialProviders}
                pendingProviderId={pendingProviderId}
                lastUsedProviderId={lastUsedProviderId}
                onSelectProvider={onSelectProvider}
                onPasskey={onPasskey}
                form={form}
                errorMessage={errorMessage}
                globalErrorMessage={globalErrorMessage}
                isPending={isPending}
                isDisabled={isDisabled}
                onSubmit={onSubmit}
                onSignUp={onSignUp}
                onJoinWaitlist={onJoinWaitlist}
              />
            ) : null;
          return (
            <>
              <Flow.Step ids={stepIds.identifier}>
                {stepKey(current) === 'identifier' ? identifierStep : null}
              </Flow.Step>

              <Flow.Step ids={stepIds.identifierChannel}>
                {stepKey(current) === 'identifier:channel' ? identifierStep : null}
              </Flow.Step>

              <Flow.Step ids={stepIds.credential}>
                {current.kind === 'credential' ? (
                  <CredentialStep
                    focusRef={focusRef}
                    step={current}
                    messages={{
                      title: m.backupCodeMfa.title,
                      description: backupCodeMessage(current, m),
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

              <Flow.Step ids={stepIds.code}>{current.kind === 'code' ? codeStep(current) : null}</Flow.Step>

              <Flow.Step ids={stepIds.choice}>
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
                    onStartOver={onStartOver}
                    logo={logo}
                    globalErrorMessage={globalErrorMessage}
                    socialProviders={socialProviders}
                    pendingProviderId={pendingProviderId}
                    onSelectProvider={onSelectProvider}
                    onCancel={onCancel}
                    pendingAccountId={pendingAccountId}
                    isDisabled={isDisabled}
                    onSelectAccount={onSelectAccount}
                    onAddAccount={onAddAccount}
                    onSignOutAll={onSignOutAll}
                  />
                ) : null}
              </Flow.Step>

              <Flow.Step ids={stepIds.notice}>
                {current.kind === 'notice' ? (
                  <NoticeStep
                    focusRef={focusRef}
                    step={current}
                    applicationName={applicationName}
                    logo={logo}
                    globalErrorMessage={globalErrorMessage}
                    isPending={isPending}
                    resend={
                      current.purpose === 'email-link' || current.purpose === 'verify-email-link'
                        ? resendFor(m.emailLink)
                        : undefined
                    }
                    onSubmit={() => onSubmit()}
                    onEmailSupport={onEmailSupport}
                    onBack={onBack}
                    onStartOver={onStartOver}
                    onRetry={onRetry}
                    protectCheckRef={protectCheckRef}
                    onEditIdentifier={onEditIdentifier}
                    onForgotPassword={onForgotPassword}
                    onCancel={onCancel}
                    onJoinWaitlist={onJoinWaitlist}
                  />
                ) : null}
              </Flow.Step>

              <Flow.Step ids={stepIds.newPassword}>
                {current.kind === 'new-password' ? (
                  <NewPasswordStep
                    focusRef={focusRef}
                    required={current.reason === 'required'}
                    form={form}
                    isPending={isPending}
                    onSubmit={onSubmit}
                    passwordFeedback={newPasswordFeedback}
                    onBack={onBack}
                  />
                ) : null}
              </Flow.Step>

              <Flow.Step ids={stepIds.signUp}>
                {current.kind === 'sign-up' ? (
                  <SignUpDetailsStep
                    focusRef={focusRef}
                    step={current}
                    logo={logo}
                    onSwitchField={onSwitchField}
                    socialProviders={socialProviders}
                    pendingProviderId={pendingProviderId}
                    onSelectProvider={onSelectProvider}
                    isDisabled={isDisabled}
                    form={form}
                    globalErrorMessage={globalErrorMessage}
                    isPending={isPending}
                    onSubmit={onSubmit}
                    passwordFeedback={newPasswordFeedback}
                    onSignIn={signUpSignIn(current, onEditIdentifier)}
                  />
                ) : null}
              </Flow.Step>
            </>
          );
        }}
      </Flow.Root>
    </Card.Root>
  );
}
