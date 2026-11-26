import type { Ref } from 'react';

import { AuthMark, emphasizeIdentifier, useAuthMark } from '../../blocks/auth';
import { Prompt } from '../../blocks/prompt';
import type { VerificationResendMessages } from '../../blocks/verification';
import { VerificationCode, verificationResend } from '../../blocks/verification';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Flow } from '../../components/flow';
import { fill, useMessages } from '../../localization';
import { SignUpDetailsStep } from '../sign-up/steps/sign-up-details';
import type { SignInStep, SignInViewProps } from './sign-in.types';
import {
  codeCopy,
  codeEditLabel,
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
  passkeyInlineFrom,
  form,
  onSubmit,
  onCodeComplete,
  isPending,
  isDisabled,
  errorMessage,
  globalErrorMessage,
  newPasswordFeedback,
  newPasswordRules,
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
  onChangeAddress,
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

  const mark = useAuthMark(applicationLogoUrl);
  const code = form.registerValue('code');

  const codeStep = (current: Extract<SignInStep, { kind: 'code' }>) => {
    const secondary = codeSecondaryAction(current, m, { onCancel, onBack });
    const identity = codeIdentity(current, m);
    const copy = codeCopy(current, m, applicationName);
    const showAddresses =
      Boolean(current.alternatives?.length) && Boolean(onChangeAddress) && current.channel !== 'totp';
    return (
      <>
        <VerificationCode
          key={`${current.purpose}:${current.channel}:${current.identifier ?? ''}`}
          focusRef={focusRef}
          messages={{
            ...copy,
            description: emphasizeIdentifier(copy.description, identity.identifier),
            ...actions,
            secondaryActionLabel: secondary.label,
            ...(current.purpose === 'reset-password' ? { primaryActionLabel: m.resetPasswordCode.verify } : {}),
          }}
          resend={resendFor(codeResendCopy(current, m))}
          prompt={
            (identity.identifier || current.purpose === 'second-factor') && current.purpose !== 'reset-password' ? (
              <Prompt
                text={m.notYou}
                action={codeEditLabel(current, m)}
                disabled={isPending}
                variant={showAddresses || secondary.onClick ? 'ghost' : 'outline'}
                onAction={onEditIdentifier}
              />
            ) : undefined
          }
          notice={codeNotice(current, m)}
          alternatives={
            showAddresses ? (
              <Button
                type='button'
                variant='outline'
                color='neutral'
                fullWidth
                disabled={isPending}
                onClick={onChangeAddress}
              >
                {current.channel === 'phone' ? m.sendToAnotherPhone : m.sendToAnotherEmail}
              </Button>
            ) : undefined
          }
          value={code.value}
          onValueChange={code.onValueChange}
          errorMessage={errorMessage}
          globalErrorMessage={globalErrorMessage}
          isPending={isPending}
          onSubmit={() => onSubmit()}
          onComplete={onCodeComplete}
          onCancel={secondary.onClick}
        />
      </>
    );
  };

  const signUpStep = (current: Extract<SignInStep, { kind: 'sign-up' }>) => {
    const identifier = form.values.identifier;
    return (
      <SignUpDetailsStep
        focusRef={focusRef}
        step={current}
        onSwitchField={onSwitchField}
        socialProviders={identifier ? [] : socialProviders}
        notice={
          identifier && current.purpose !== 'continue' ? (
            <Prompt
              text={fill(m.noAccount, { applicationName, identifier: identifier })}
              action={identifier.includes('@') ? m.useDifferentEmail : m.useDifferentPhoneNumber}
              disabled={isPending}
              onAction={onEditIdentifier}
            />
          ) : undefined
        }
        pendingProviderId={pendingProviderId}
        onSelectProvider={onSelectProvider}
        isDisabled={isDisabled}
        form={form}
        globalErrorMessage={globalErrorMessage}
        isPending={isPending}
        onSubmit={onSubmit}
        passwordFeedback={newPasswordFeedback}
        passwordRules={newPasswordRules}
        onSignIn={signUpSignIn(current, onEditIdentifier)}
      />
    );
  };

  return (
    <Card.Root
      align='center'
      variant='prominent'
    >
      {mark.logoUrl ? (
        <AuthMark
          key={mark.logoUrl}
          logoUrl={mark.logoUrl}
          shape={mark.shape}
          onShape={mark.onShape}
          onError={mark.onError}
        />
      ) : null}
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
                applicationName={applicationName}
                combined={combined}
                socialProviders={socialProviders}
                pendingProviderId={pendingProviderId}
                lastUsedProviderId={lastUsedProviderId}
                onSelectProvider={onSelectProvider}
                onPasskey={onPasskey}
                passkeyInlineFrom={passkeyInlineFrom}
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
                    globalErrorMessage={globalErrorMessage}
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
                    passwordRules={newPasswordRules}
                    onBack={onBack}
                  />
                ) : null}
              </Flow.Step>

              <Flow.Step ids={stepIds.signUp}>{current.kind === 'sign-up' ? signUpStep(current) : null}</Flow.Step>
            </>
          );
        }}
      </Flow.Root>
    </Card.Root>
  );
}
