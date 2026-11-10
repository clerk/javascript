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

// TODO: Move factorLabel, choiceCopy and codeCopy to sign-in.utils.ts and test them there.
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
    secondaryActionLabel: m.useAnotherMethod,
    primaryActionLabel: m.continue,
    pendingLabel: m.verifying,
  };
  const resend = {
    text: m.emailCode.resendPrompt,
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
                messages={{
                  title: fill(combined ? m.start.titleCombined : m.start.title, { applicationName }),
                  description: combined ? m.start.descriptionCombined : m.start.description,
                  socialButton: provider => fill(m.start.socialButton, { provider }),
                  dividerText: m.start.divider,
                  fieldLabel: m.start.emailLabel,
                  fieldPlaceholder: m.start.emailPlaceholder,
                  primaryActionLabel: m.continue,
                  pendingLabel: m.verifying,
                  actionText: m.start.signUpPrompt,
                  actionLink: m.start.signUpLink,
                }}
                socialProviders={socialProviders}
                pendingProviderId={pendingProviderId}
                onSelectProvider={onSelectProvider}
                value={identifier}
                errorMessage={errorMessage}
                isPending={isPending}
                onValueChange={onIdentifierChange}
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
                    password: {
                      title: m.password.title,
                      description: m.password.description,
                      identityEditLabel: m.password.editIdentifier,
                      fieldLabel: m.password.label,
                      fieldPlaceholder: m.password.placeholder,
                      showPasswordLabel: m.showPassword,
                      hidePasswordLabel: m.hidePassword,
                      forgotPasswordLabel: m.password.forgotPassword,
                      ...actions,
                    },
                    backupCode: {
                      title: m.backupCodeMfa.title,
                      description: m.backupCodeMfa.description,
                      fieldLabel: m.backupCodeMfa.label,
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
                    description: m.alternativeMethods.description,
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

            <Flow.Step ids={['notice:help']}>
              {current.kind === 'notice' ? (
                <NoticeStep
                  step={current}
                  messages={{
                    help: {
                      title: m.alternativeMethods.getHelp.title,
                      description: m.alternativeMethods.getHelp.description,
                      backButton: m.back,
                      supportButton: m.alternativeMethods.getHelp.emailSupport,
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
                  description: m.signUp.description,
                  firstNameLabel: m.signUp.firstNameLabel,
                  firstNamePlaceholder: m.signUp.firstNamePlaceholder,
                  lastNameLabel: m.signUp.lastNameLabel,
                  lastNamePlaceholder: m.signUp.lastNamePlaceholder,
                  emailLabel: m.signUp.emailLabel,
                  emailPlaceholder: m.signUp.emailPlaceholder,
                  passwordLabel: m.signUp.passwordLabel,
                  passwordPlaceholder: m.signUp.passwordPlaceholder,
                  showPasswordLabel: m.showPassword,
                  hidePasswordLabel: m.hidePassword,
                  primaryActionLabel: m.continue,
                  pendingLabel: m.verifying,
                  actionText: m.signUp.signInPrompt,
                  actionLink: m.signUp.signInLink,
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
