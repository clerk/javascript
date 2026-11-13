import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import type { VerificationCodeResend } from '../../blocks/verification';
import { Card } from '../../components/card';
import { Flow } from '../../components/flow';
import { rich, useMessages } from '../../localization';
import { tabularNumbersStyle } from '../../styles/typography.styles';
import { codeCopy, codeIdentity, codeResendCopy, codeSecondaryAction } from '../sign-in/sign-in.utils';
import { CodeStep } from '../sign-in/steps/code-step';
import { SignInActionBlocked } from '../sign-in/steps/sign-in-action-blocked';
import { SignInAlternativeChannel } from '../sign-in/steps/sign-in-alternative-channel';
import { SignInEmailLink } from '../sign-in/steps/sign-in-email-link';
import { SignInEmailLinkStatus } from '../sign-in/steps/sign-in-email-link-status';
import { SignInEnterpriseConnections } from '../sign-in/steps/sign-in-enterprise-connections';
import { SignInLoading } from '../sign-in/steps/sign-in-loading';
import { SignInProtectCheck } from '../sign-in/steps/sign-in-protect-check';
import { SignInWallets } from '../sign-in/steps/sign-in-wallets';
import type { SignUpStep, SignUpViewProps } from './sign-up.types';
import { signUpCodeStep, signUpStepIds, signUpStepKey } from './sign-up.utils';
import { SignUpDetailsStep } from './steps/sign-up-details';
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
          <SignInEmailLink
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
          <SignInEmailLinkStatus
            step={{ kind: 'notice', purpose: 'email-link-status', status: current.status, flow: 'sign-up' }}
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
        return <SignInLoading globalErrorMessage={globalErrorMessage} />;
      case 'protect-check':
        return (
          <SignInProtectCheck
            challenge={current.challenge}
            logo={logo}
            globalErrorMessage={globalErrorMessage}
            isPending={isPending}
            containerRef={protectCheckRef}
            onRetry={onRetry}
          />
        );
      case 'action-blocked':
        return <SignInActionBlocked details={current.details} />;
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
                  logo={current.purpose === 'start' ? logo : undefined}
                  captcha={current.purpose === 'start'}
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
                <SignInAlternativeChannel
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
                />
              ) : null}
            </Flow.Step>

            <Flow.Step ids={signUpStepIds.code}>{current.kind === 'code' ? code(current) : null}</Flow.Step>

            <Flow.Step ids={signUpStepIds.choice}>
              {current.kind === 'choice' && current.purpose === 'enterprise-connections' ? (
                <SignInEnterpriseConnections
                  focusRef={focusRef}
                  logo={logo}
                  connections={current.options}
                  globalErrorMessage={globalErrorMessage}
                  pendingConnectionId={pendingProviderId}
                  onSelectConnection={onSelectProvider}
                />
              ) : null}
              {current.kind === 'choice' && current.purpose === 'wallets' ? (
                <SignInWallets
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
