import type { Ref } from 'react';

import {
  AuthActionBlocked,
  AuthAlternativeChannel,
  AuthEmailLink,
  AuthEmailLinkStatus,
  AuthEnterpriseConnections,
  AuthIdentityPreview,
  AuthLoading,
  AuthProtectCheck,
  AuthStartOver,
  AuthWallets,
} from '../../blocks/auth';
import type { VerificationResendMessages } from '../../blocks/verification';
import { VerificationCode, verificationResend } from '../../blocks/verification';
import { Card } from '../../components/card';
import { Flow } from '../../components/flow';
import { useMessages } from '../../localization';
import type { SignUpStep, SignUpViewProps } from './sign-up.types';
import {
  signUpCodeCopy,
  signUpCodeIdentity,
  signUpCodeSecondaryAction,
  signUpStepIds,
  signUpStepKey,
} from './sign-up.utils';
import { SignUpDetailsStep } from './steps/sign-up-details';
import { SignUpLegalConsentField } from './steps/sign-up-legal-consent';
import { SignUpRestricted } from './steps/sign-up-restricted';

export function SignUpView({
  step,
  direction,
  applicationName,
  applicationLogoUrl,
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
  passwordFeedback,
  onSwitchField,
  onSignIn,
  onEditIdentifier,
  onCancel,
  onBack,
  onStartOver,
  onEmailSupport,
  onJoinWaitlist,
  onResend,
  canResend,
  resendRemainingSeconds,
  onRetry,
  protectCheckRef,
  focusRef,
}: SignUpViewProps & { focusRef?: Ref<HTMLElement> }) {
  const m = useMessages('signUp');
  const logo = applicationLogoUrl ? { src: applicationLogoUrl, alt: applicationName } : undefined;

  const resendFor = (copy: VerificationResendMessages) =>
    verificationResend(copy, { onResend, canResend, remainingSeconds: resendRemainingSeconds });

  const notice = (current: Extract<SignUpStep, { kind: 'notice' }>) => {
    switch (current.purpose) {
      case 'verify-email-link':
        return (
          <AuthEmailLink
            focusRef={focusRef}
            messages={{
              title: m.verifyEmailLink.title,
              description: m.verifyEmailLink.description,
              editIdentifier: m.editIdentifier,
              secondaryActionLabel: m.useAnotherMethod,
            }}
            identifier={current.identifier}
            onEditIdentifier={onEditIdentifier}
            globalErrorMessage={globalErrorMessage}
            isPending={isPending}
            resend={resendFor(m.verifyEmailLink)}
          />
        );
      case 'email-link-status':
        return (
          <AuthEmailLinkStatus
            messages={m.emailLinkStatus}
            status={current.status}
            globalErrorMessage={globalErrorMessage}
          />
        );
      case 'restricted':
      case 'waitlist':
        return (
          <SignUpRestricted
            focusRef={focusRef}
            waitlist={current.purpose === 'waitlist'}
            logo={logo}
            globalErrorMessage={globalErrorMessage}
            onEmailSupport={onEmailSupport}
            onJoinWaitlist={onJoinWaitlist}
            onSignIn={onSignIn}
          />
        );
      case 'loading':
        return (
          <AuthLoading
            messages={{ loading: m.loading }}
            globalErrorMessage={globalErrorMessage}
          />
        );
      case 'protect-check':
        return (
          <AuthProtectCheck
            messages={{ ...m.protectCheck, loading: m.loading }}
            challenge={current.challenge}
            logo={logo}
            globalErrorMessage={globalErrorMessage}
            isPending={isPending}
            containerRef={protectCheckRef}
            onRetry={onRetry}
          />
        );
      case 'start-over':
        return (
          <AuthStartOver
            messages={m.startOver}
            onStartOver={onStartOver}
          />
        );
      case 'action-blocked':
        return (
          <AuthActionBlocked
            messages={m.actionBlocked}
            details={current.details}
          />
        );
    }
  };

  const code = (current: Extract<SignUpStep, { kind: 'code' }>) => {
    const secondary = signUpCodeSecondaryAction(current, m, onCancel);
    const identity = signUpCodeIdentity(current, m);
    const field = form.registerValue('code');
    return (
      <VerificationCode
        focusRef={focusRef}
        messages={{
          ...signUpCodeCopy(current, m),
          secondaryActionLabel: secondary.label,
          primaryActionLabel: m.submit,
          pendingLabel: m.verifying,
        }}
        resend={resendFor(current.purpose === 'verify-email' ? m.verifyEmail : m.verifyPhone)}
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
        value={field.value}
        onValueChange={field.onValueChange}
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
        value={signUpStepKey(step)}
        direction={direction}
        state={step}
      >
        {current => (
          <>
            <Flow.Step ids={signUpStepIds.details}>
              {current.kind === 'details' ? (
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
                  passwordFeedback={passwordFeedback}
                  onSignIn={onSignIn}
                />
              ) : null}
            </Flow.Step>

            <Flow.Step ids={signUpStepIds.alternativePhone}>
              {current.kind === 'alternative-phone' ? (
                <AuthAlternativeChannel
                  focusRef={focusRef}
                  messages={{
                    title: m.alternativePhone.title,
                    description: m.alternativePhone.description,
                    fieldLabel: m.alternativePhone.label,
                    phonePlaceholder: m.form.phonePlaceholder,
                    selectedCountry: m.form.selectedCountry,
                    chooseCountry: m.form.chooseCountry,
                    searchCountries: m.form.searchCountries,
                    countrySearchPlaceholder: m.form.countrySearchPlaceholder,
                    noCountries: m.form.noCountries,
                    secondaryActionLabel: m.useAnotherMethod,
                    primaryActionLabel: m.submit,
                    pendingLabel: m.verifying,
                  }}
                  channel={current.channel}
                  applicationName={applicationName}
                  logo={logo}
                  form={form}
                  globalErrorMessage={globalErrorMessage}
                  isPending={isPending}
                  isDisabled={isDisabled}
                  onSubmit={onSubmit}
                  onCancel={onCancel}
                >
                  {current.legalConsent ? (
                    <SignUpLegalConsentField
                      form={form}
                      consent={current.legalConsent}
                      disabled={isDisabled}
                    />
                  ) : null}
                </AuthAlternativeChannel>
              ) : null}
            </Flow.Step>

            <Flow.Step ids={signUpStepIds.code}>{current.kind === 'code' ? code(current) : null}</Flow.Step>

            <Flow.Step ids={signUpStepIds.choice}>
              {current.kind === 'choice' && current.purpose === 'enterprise-connections' ? (
                <AuthEnterpriseConnections
                  focusRef={focusRef}
                  messages={{
                    title: m.enterpriseConnections.title,
                    description: m.enterpriseConnections.description,
                    pendingLabel: m.enterpriseConnections.pending,
                  }}
                  logo={logo}
                  connections={current.options}
                  globalErrorMessage={globalErrorMessage}
                  pendingConnectionId={pendingProviderId}
                  onSelectConnection={onSelectProvider}
                />
              ) : null}
              {current.kind === 'choice' && current.purpose === 'wallets' ? (
                <AuthWallets
                  focusRef={focusRef}
                  messages={{ ...m.wallets, backButton: m.back, pendingLabel: m.verifying, loading: m.loading }}
                  wallets={current.options}
                  globalErrorMessage={globalErrorMessage}
                  pendingWalletId={pendingProviderId}
                  isDisabled={isDisabled}
                  onSelectWallet={onSelectProvider}
                  onBack={onBack}
                />
              ) : null}
            </Flow.Step>

            <Flow.Step ids={signUpStepIds.notice}>{current.kind === 'notice' ? notice(current) : null}</Flow.Step>
          </>
        )}
      </Flow.Root>
    </Card.Root>
  );
}
