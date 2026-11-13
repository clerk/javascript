import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import type { VerificationCodeResend } from '../../blocks/verification';
import { Card } from '../../components/card';
import { Flow } from '../../components/flow';
import { rich, useMessages } from '../../localization';
import { tabularNumbersStyle } from '../../styles/typography.styles';
import { codeCopy, codeIdentity, codeResendCopy, codeSecondaryAction } from '../auth-flow/auth-flow.utils';
import { ActionBlockedNotice } from '../auth-flow/steps/action-blocked';
import { AlternativeChannelStep } from '../auth-flow/steps/alternative-channel';
import { CodeStep } from '../auth-flow/steps/code-step';
import { EmailLinkNotice } from '../auth-flow/steps/email-link';
import { EmailLinkStatusNotice } from '../auth-flow/steps/email-link-status';
import { EnterpriseConnectionsChoice } from '../auth-flow/steps/enterprise-connections';
import { LoadingNotice } from '../auth-flow/steps/loading';
import { ProtectCheckNotice } from '../auth-flow/steps/protect-check';
import { WalletsChoice } from '../auth-flow/steps/wallets';
import type { SignUpStep, SignUpViewProps } from './sign-up.types';
import { signUpCodeStep, signUpStepIds, signUpStepKey } from './sign-up.utils';
import { SignUpDetailsStep } from './steps/sign-up-details';
import { SignUpLegalConsentField } from './steps/sign-up-legal-consent';
import { SignUpRestricted } from './steps/sign-up-restricted';

type ResendCopy = { resendText: string; resend: string; resendCountdown: `${string}{seconds}${string}` };

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
  const shared = useMessages('signIn');
  const logo = applicationLogoUrl ? { src: applicationLogoUrl, alt: applicationName } : undefined;

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

  const notice = (current: Extract<SignUpStep, { kind: 'notice' }>) => {
    switch (current.purpose) {
      case 'verify-email-link':
        return (
          <EmailLinkNotice
            focusRef={focusRef}
            title={shared.verifyEmailLink.title}
            description={shared.verifyEmailLink.description}
            identifier={current.identifier}
            onEditIdentifier={onEditIdentifier}
            globalErrorMessage={globalErrorMessage}
            isPending={isPending}
            resend={resendFor(shared.emailLink)}
          />
        );
      case 'email-link-status':
        return (
          <EmailLinkStatusNotice
            step={{ status: current.status, flow: 'sign-up' }}
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
        return <LoadingNotice globalErrorMessage={globalErrorMessage} />;
      case 'protect-check':
        return (
          <ProtectCheckNotice
            challenge={current.challenge}
            logo={logo}
            globalErrorMessage={globalErrorMessage}
            isPending={isPending}
            containerRef={protectCheckRef}
            onRetry={onRetry}
          />
        );
      case 'action-blocked':
        return <ActionBlockedNotice details={current.details} />;
    }
  };

  const code = (current: Extract<SignUpStep, { kind: 'code' }>) => {
    const codeStep = signUpCodeStep(current);
    const secondary = codeSecondaryAction(codeStep, shared, { onCancel, onBack });
    return (
      <CodeStep
        focusRef={focusRef}
        messages={{
          ...codeCopy(codeStep, shared, applicationName),
          secondaryActionLabel: secondary.label,
          primaryActionLabel: shared.continue,
          pendingLabel: shared.verifying,
        }}
        resend={resendFor(codeResendCopy(codeStep, shared))}
        identity={codeIdentity(codeStep, shared)}
        form={form}
        errorMessage={errorMessage}
        globalErrorMessage={globalErrorMessage}
        isPending={isPending}
        onSubmit={onSubmit}
        onCodeComplete={onCodeComplete}
        onEditIdentifier={onEditIdentifier}
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
                <AlternativeChannelStep
                  focusRef={focusRef}
                  channel={current.channel}
                  copy={m.alternativePhone}
                  applicationName={applicationName}
                  logo={logo}
                  form={form}
                  errorMessage={errorMessage}
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
                </AlternativeChannelStep>
              ) : null}
            </Flow.Step>

            <Flow.Step ids={signUpStepIds.code}>{current.kind === 'code' ? code(current) : null}</Flow.Step>

            <Flow.Step ids={signUpStepIds.choice}>
              {current.kind === 'choice' && current.purpose === 'enterprise-connections' ? (
                <EnterpriseConnectionsChoice
                  focusRef={focusRef}
                  logo={logo}
                  connections={current.options}
                  globalErrorMessage={globalErrorMessage}
                  pendingConnectionId={pendingProviderId}
                  onSelectConnection={onSelectProvider}
                />
              ) : null}
              {current.kind === 'choice' && current.purpose === 'wallets' ? (
                <WalletsChoice
                  focusRef={focusRef}
                  title={m.wallets.title}
                  description={m.wallets.description}
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
