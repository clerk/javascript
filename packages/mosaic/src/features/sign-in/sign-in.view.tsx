import type { Ref } from 'react';

import { AuthIdentityPreview } from '../../blocks/auth';
import type { VerificationResendMessages } from '../../blocks/verification';
import { VerificationCode, verificationResend } from '../../blocks/verification';
import { Card } from '../../components/card';
import { Flow } from '../../components/flow';
import { useMessages } from '../../localization';
import { SignUpDetailsStep } from '../sign-up/sign-up-details/sign-up-details';
import type { SignInStep, SignInViewProps } from './sign-in.types';
import {
  codeCopy,
  codeIdentity,
  codeNotice,
  codeResendCopy,
  codeSecondaryAction,
  stepIds,
  stepKey,
} from './sign-in.utils';
import { ChoiceStep } from './steps/choice-step';
import { CredentialStep } from './steps/credential-step';
import { IdentifierStep } from './steps/identifier-step';
import { NewPasswordStep } from './steps/new-password-step';
import { NoticeStep } from './steps/notice-step';

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
  const resendFor = (copy: VerificationResendMessages) =>
    verificationResend(copy, { onResend, canResend, remainingSeconds: resendRemainingSeconds });

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
            <AuthIdentityPreview
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
                    pendingFactorId={pendingFactorId}
                    onSelectFactor={onSelectFactor}
                    onShowHelp={onShowHelp}
                    onBack={onBack}
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
