import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import type { VerificationCodeMessages } from '../../blocks/verification';
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
import { NoticeStep } from './steps/notice-step';
import { SecretStep } from './steps/secret-step';
import { SignUpDetailsStep } from './steps/sign-up-details';

type Messages = MosaicMessages['signIn'];
type CodeStepData = Extract<SignInStep, { kind: 'code' }>;

function factorLabel(factor: SignInFactor, m: Messages): string {
  switch (factor.strategy) {
    case 'password':
      return m.alternativeMethods.blockButtonPassword;
    case 'passkey':
      return m.alternativeMethods.blockButtonPasskey;
    case 'email_code':
      return fill(m.alternativeMethods.blockButtonEmailCode, { identifier: factor.identifier });
    case 'phone_code':
      return fill(m.alternativeMethods.blockButtonPhoneCode, { identifier: factor.identifier });
    case 'totp':
      return m.alternativeMethods.blockButtonTotp;
    case 'backup_code':
      return m.alternativeMethods.blockButtonBackupCode;
  }
}

function codeCopy(
  step: CodeStepData,
  m: Messages,
): Pick<VerificationCodeMessages, 'title' | 'description' | 'fieldLabel'> {
  const identifier = step.identifier ?? '';
  if (step.purpose === 'verify-email') {
    return {
      title: m.verifyEmail.title,
      description: fill(m.verifyEmail.subtitle, { identifier }),
      fieldLabel: m.verifyEmail.formTitle,
    };
  }
  if (step.channel === 'totp') {
    return { title: m.totpMfa.title, description: m.totpMfa.subtitle, fieldLabel: m.totpMfa.formTitle };
  }
  if (step.channel === 'phone') {
    const copy = step.purpose === 'second-factor' ? m.phoneCodeMfa : m.phoneCode;
    return { title: copy.title, description: fill(copy.subtitle, { identifier }), fieldLabel: copy.formTitle };
  }
  return {
    title: m.emailCode.title,
    description: fill(m.emailCode.subtitle, { identifier }),
    fieldLabel: m.emailCode.formTitle,
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
  identifier,
  onIdentifierChange,
  onEditIdentifier,
  onSignUp,
  value,
  onValueChange,
  errorMessage,
  isPending,
  onSubmit,
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
  signUpDetails,
  signUpErrors,
  onSignUpDetailChange,
  focusRef,
}: SignInViewProps & { focusRef?: Ref<HTMLElement> }) {
  const m = useMessages('signIn');

  const actions = {
    secondaryActionLabel: m.footerActionLinkUseAnotherMethod,
    primaryActionLabel: m.formButtonPrimary,
    pendingLabel: m.verifying,
  };
  const resend = {
    text: m.emailCode.resendText,
    label: resendRemainingSeconds ? (
      <span>
        {rich(m.emailCode.resendCountdown, {
          values: {
            seconds: <span {...stylex.props(tabularNumbersStyle.enabled)}>{resendRemainingSeconds}</span>,
          },
        })}
      </span>
    ) : (
      m.emailCode.resend
    ),
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
                messages={{
                  title: fill(combined ? m.start.titleCombined : m.start.title, { applicationName }),
                  description: combined ? m.start.subtitleCombined : m.start.subtitle,
                  socialButton: provider => fill(m.socialButton, { provider }),
                  dividerText: m.dividerText,
                  fieldLabel: m.formFieldLabelEmailAddress,
                  fieldPlaceholder: m.formFieldInputPlaceholderEmailAddress,
                  primaryActionLabel: m.formButtonPrimary,
                  pendingLabel: m.verifying,
                  actionText: m.start.actionText,
                  actionLink: m.start.actionLink,
                }}
                socialProviders={socialProviders}
                pendingProviderId={pendingProviderId}
                onSelectProvider={onSelectProvider}
                value={identifier}
                errorMessage={errorMessage}
                isPending={isPending}
                onValueChange={onIdentifierChange}
                onSubmit={onSubmit}
                onSignUp={combined ? undefined : onSignUp}
              />
            </Flow.Step>

            <Flow.Step ids={['secret:password', 'secret:backup-code']}>
              {current.kind === 'secret' ? (
                <SecretStep
                  focusRef={focusRef}
                  step={current}
                  messages={{
                    password: {
                      title: m.password.title,
                      description: m.password.subtitle,
                      identityEditLabel: m.identityPreviewEditButton,
                      fieldLabel: m.formFieldLabelPassword,
                      fieldPlaceholder: m.formFieldInputPlaceholderPassword,
                      showPasswordLabel: m.formFieldActionShowPassword,
                      hidePasswordLabel: m.formFieldActionHidePassword,
                      forgotPasswordLabel: m.password.actionLink,
                      ...actions,
                    },
                    backupCode: {
                      title: m.backupCodeMfa.title,
                      description: m.backupCodeMfa.subtitle,
                      fieldLabel: m.formFieldLabelBackupCode,
                      ...actions,
                    },
                  }}
                  value={value}
                  errorMessage={errorMessage}
                  isPending={isPending}
                  onValueChange={onValueChange}
                  onSubmit={onSubmit}
                  onEditIdentifier={onEditIdentifier}
                  onForgotPassword={onForgotPassword}
                  onShowMethods={onShowMethods}
                />
              ) : null}
            </Flow.Step>

            <Flow.Step ids={['code:first-factor', 'code:second-factor', 'code:verify-email']}>
              {current.kind === 'code' ? (
                <CodeStep
                  focusRef={focusRef}
                  step={current}
                  messages={{ ...codeCopy(current, m), ...actions }}
                  resend={resend}
                  value={value}
                  errorMessage={errorMessage}
                  isPending={isPending}
                  onValueChange={onValueChange}
                  onSubmit={onSubmit}
                  onShowMethods={onShowMethods}
                />
              ) : null}
            </Flow.Step>

            <Flow.Step ids={['choice:methods']}>
              {current.kind === 'choice' ? (
                <ChoiceStep
                  focusRef={focusRef}
                  step={current}
                  messages={{
                    title: m.alternativeMethods.title,
                    description: m.alternativeMethods.subtitle,
                    backButton: m.backButton,
                    helpText: m.alternativeMethods.actionText,
                    helpButton: m.alternativeMethods.actionLink,
                  }}
                  factorLabel={factor => factorLabel(factor, m)}
                  pendingFactorId={pendingFactorId}
                  onSelectFactor={onSelectFactor}
                  onShowHelp={onShowHelp}
                  onBack={onBack}
                />
              ) : null}
            </Flow.Step>

            <Flow.Step ids={['notice:help']}>
              {current.kind === 'notice' ? (
                <NoticeStep
                  step={current}
                  messages={{
                    help: {
                      title: m.alternativeMethods.getHelp.title,
                      description: m.alternativeMethods.getHelp.content,
                      backButton: m.backButton,
                      supportButton: m.alternativeMethods.getHelp.blockButtonEmailSupport,
                    },
                  }}
                  onEmailSupport={onEmailSupport}
                  onBack={onBack}
                />
              ) : null}
            </Flow.Step>

            <Flow.Step ids={['sign-up']}>
              <SignUpDetailsStep
                focusRef={focusRef}
                messages={{
                  title: m.signUp.title,
                  description: m.signUp.subtitle,
                  firstNameLabel: m.formFieldLabelFirstName,
                  firstNamePlaceholder: m.formFieldInputPlaceholderFirstName,
                  lastNameLabel: m.formFieldLabelLastName,
                  lastNamePlaceholder: m.formFieldInputPlaceholderLastName,
                  emailLabel: m.formFieldLabelEmailAddress,
                  emailPlaceholder: m.formFieldInputPlaceholderEmailAddress,
                  passwordLabel: m.formFieldLabelPassword,
                  passwordPlaceholder: m.formFieldInputPlaceholderPassword,
                  showPasswordLabel: m.formFieldActionShowPassword,
                  hidePasswordLabel: m.formFieldActionHidePassword,
                  primaryActionLabel: m.formButtonPrimary,
                  pendingLabel: m.verifying,
                  actionText: m.signUp.actionText,
                  actionLink: m.signUp.actionLink,
                }}
                values={signUpDetails}
                errors={signUpErrors}
                isPending={isPending}
                onValueChange={onSignUpDetailChange}
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
