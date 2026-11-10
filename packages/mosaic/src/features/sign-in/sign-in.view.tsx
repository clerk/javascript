import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import {
  VerificationBackupCode,
  VerificationCode,
  VerificationHelp,
  VerificationMethodPicker,
} from '../../blocks/verification';
import { Flow } from '../../components/flow';
import type { IconComponent } from '../../icons/glyph';
import { Envelope } from '../../icons/glyphs/envelope';
import { Key } from '../../icons/glyphs/key';
import { SecurityLockSquare } from '../../icons/glyphs/security-lock-square';
import { SecurityPasskey } from '../../icons/glyphs/security-passkey';
import { SecurityPhone } from '../../icons/glyphs/security-phone';
import type { MosaicMessages } from '../../localization';
import { fill, rich, useMessages } from '../../localization';
import { tabularNumbersStyle } from '../../styles/typography.styles';
import type { SignInMethod, SignInViewProps } from './sign-in.types';
import { SignInPassword } from './steps/sign-in-password';
import { SignInStart } from './steps/sign-in-start';
import { SignUpDetailsStep } from './steps/sign-up-details';

type Messages = MosaicMessages['signIn'];

const methodIcon = {
  password: SecurityLockSquare,
  passkey: SecurityPasskey,
  email_code: Envelope,
  phone_code: SecurityPhone,
  totp: SecurityLockSquare,
  backup_code: Key,
} as const satisfies Record<SignInMethod['strategy'], IconComponent>;

function methodLabel(method: SignInMethod, m: Messages): string {
  const identifier = 'identifier' in method ? method.identifier : '';
  switch (method.strategy) {
    case 'password':
      return m.alternativeMethods.blockButtonPassword;
    case 'passkey':
      return m.alternativeMethods.blockButtonPasskey;
    case 'email_code':
      return fill(m.alternativeMethods.blockButtonEmailCode, { identifier });
    case 'phone_code':
      return fill(m.alternativeMethods.blockButtonPhoneCode, { identifier });
    case 'totp':
      return m.alternativeMethods.blockButtonTotp;
    case 'backup_code':
      return m.alternativeMethods.blockButtonBackupCode;
  }
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
  methods,
  pendingMethodId,
  onSelectMethod,
  otpChannel,
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
  const hasAlternatives = methods.length > 0;
  const resend =
    otpChannel === 'email' || otpChannel === 'phone'
      ? {
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
        }
      : undefined;
  const otpSubmit = (code: string) => {
    onValueChange(code);
    onSubmit();
  };

  return (
    <Flow.Root
      value={step}
      direction={direction}
      state={step}
    >
      {() => (
        <>
          <Flow.Step ids={['start']}>
            <SignInStart
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

          <Flow.Step ids={['password']}>
            <SignInPassword
              focusRef={focusRef}
              messages={{
                title: m.password.title,
                description: m.password.subtitle,
                identityEditLabel: m.identityPreviewEditButton,
                fieldLabel: m.formFieldLabelPassword,
                fieldPlaceholder: m.formFieldInputPlaceholderPassword,
                showPasswordLabel: m.formFieldActionShowPassword,
                hidePasswordLabel: m.formFieldActionHidePassword,
                forgotPasswordLabel: m.password.actionLink,
                ...actions,
              }}
              identifier={identifier}
              onEditIdentifier={onEditIdentifier}
              value={value}
              errorMessage={errorMessage}
              isPending={isPending}
              onValueChange={onValueChange}
              onSubmit={onSubmit}
              onForgotPassword={onForgotPassword}
              onCancel={hasAlternatives ? onShowMethods : undefined}
            />
          </Flow.Step>

          <Flow.Step ids={['email-code']}>
            <VerificationCode
              focusRef={focusRef}
              messages={{
                title: m.emailCode.title,
                description: fill(m.emailCode.subtitle, { identifier }),
                fieldLabel: m.emailCode.formTitle,
                ...actions,
              }}
              value={value}
              errorMessage={errorMessage}
              isPending={isPending}
              resend={resend}
              onValueChange={onValueChange}
              onComplete={otpSubmit}
              onSubmit={onSubmit}
              onCancel={hasAlternatives ? onShowMethods : undefined}
            />
          </Flow.Step>

          <Flow.Step ids={['totp']}>
            <VerificationCode
              focusRef={focusRef}
              messages={{
                title: m.totpMfa.title,
                description: m.totpMfa.subtitle,
                fieldLabel: m.totpMfa.formTitle,
                ...actions,
              }}
              value={value}
              errorMessage={errorMessage}
              isPending={isPending}
              onValueChange={onValueChange}
              onComplete={otpSubmit}
              onSubmit={onSubmit}
              onCancel={hasAlternatives ? onShowMethods : undefined}
            />
          </Flow.Step>

          <Flow.Step ids={['backup-code']}>
            <VerificationBackupCode
              focusRef={focusRef}
              messages={{
                title: m.backupCodeMfa.title,
                description: m.backupCodeMfa.subtitle,
                fieldLabel: m.formFieldLabelBackupCode,
                ...actions,
              }}
              value={value}
              errorMessage={errorMessage}
              isPending={isPending}
              onValueChange={onValueChange}
              onSubmit={onSubmit}
              onCancel={hasAlternatives ? onShowMethods : undefined}
            />
          </Flow.Step>

          <Flow.Step ids={['method-picker']}>
            <VerificationMethodPicker
              focusRef={focusRef}
              messages={{
                title: m.alternativeMethods.title,
                description: m.alternativeMethods.subtitle,
                backButton: m.backButton,
                helpText: m.alternativeMethods.actionText,
                helpButton: m.alternativeMethods.actionLink,
              }}
              methods={methods.map(method => ({
                id: method.id,
                label: methodLabel(method, m),
                icon: methodIcon[method.strategy],
              }))}
              pendingMethodId={pendingMethodId}
              onSelect={onSelectMethod}
              onHelp={onShowHelp}
              onBack={onBack}
            />
          </Flow.Step>

          <Flow.Step ids={['help']}>
            <VerificationHelp
              messages={{
                title: m.alternativeMethods.getHelp.title,
                description: m.alternativeMethods.getHelp.content,
                backButton: m.backButton,
                supportButton: m.alternativeMethods.getHelp.blockButtonEmailSupport,
              }}
              onEmailSupport={onEmailSupport}
              onBack={onBack}
            />
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

          <Flow.Step ids={['verify-email']}>
            <VerificationCode
              focusRef={focusRef}
              messages={{
                title: m.verifyEmail.title,
                description: fill(m.verifyEmail.subtitle, { identifier: signUpDetails.emailAddress }),
                fieldLabel: m.verifyEmail.formTitle,
                ...actions,
              }}
              value={value}
              errorMessage={errorMessage}
              isPending={isPending}
              resend={resend}
              onValueChange={onValueChange}
              onComplete={otpSubmit}
              onSubmit={onSubmit}
            />
          </Flow.Step>
        </>
      )}
    </Flow.Root>
  );
}
