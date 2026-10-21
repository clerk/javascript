import type { Ref } from 'react';

import { Flow } from '../../components/flow';
import type { IconName } from '../../icons/registry';
import type { MosaicMessages } from '../../localization';
import { fill, useMessages } from '../../localization';
import { ReverificationBackupCode } from '../reverification/steps/reverification-backup-code';
import { ReverificationHelp } from '../reverification/steps/reverification-help';
import { ReverificationMethodPicker } from '../reverification/steps/reverification-method-picker';
import { ReverificationOTP } from '../reverification/steps/reverification-otp';
import type { SignInMethod, SignInViewProps } from './sign-in.types';
import { SignInPassword } from './steps/sign-in-password';
import { SignInStart } from './steps/sign-in-start';
import { SignUpDetailsStep } from './steps/sign-up-details';

type Messages = MosaicMessages['signIn'];

const methodIcon = {
  password: 'security-lock-square',
  passkey: 'security-passkey',
  email_code: 'envelope',
  phone_code: 'security-phone',
  totp: 'security-lock-square',
  backup_code: 'key',
} as const satisfies Record<SignInMethod['strategy'], IconName>;

function methodLabel(method: SignInMethod, m: Messages): string {
  const identifier = 'identifier' in method ? method.identifier : '';
  switch (method.strategy) {
    case 'password':
      return m.alternativeMethods.blockButton__password;
    case 'passkey':
      return m.alternativeMethods.blockButton__passkey;
    case 'email_code':
      return fill(m.alternativeMethods.blockButton__emailCode, { identifier });
    case 'phone_code':
      return fill(m.alternativeMethods.blockButton__phoneCode, { identifier });
    case 'totp':
      return m.alternativeMethods.blockButton__totp;
    case 'backup_code':
      return m.alternativeMethods.blockButton__backupCode;
  }
}

export function SignInView({
  step,
  direction,
  applicationName,
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
}: SignInViewProps & { focusRef?: Ref<HTMLElement> }): JSX.Element {
  const m = useMessages('signIn');

  const actions = {
    secondaryActionLabel: m.footerActionLink__useAnotherMethod,
    primaryActionLabel: m.formButtonPrimary,
    pendingLabel: m.verifying,
  };
  const hasAlternatives = methods.length > 0;
  const resendLabel = m.emailCode.resendButton;
  const resend =
    otpChannel === 'email' || otpChannel === 'phone'
      ? {
          label: resendRemainingSeconds ? `${resendLabel} (${resendRemainingSeconds})` : resendLabel,
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
              messages={{
                title: fill(combined ? m.start.titleCombined : m.start.title, { applicationName }),
                description: combined ? m.start.subtitleCombined : m.start.subtitle,
                socialBlockButton: provider => fill(m.socialButtonsBlockButton, { provider }),
                socialIconButton: provider => fill(m.socialButtonsIconButton, { provider }),
                dividerText: m.dividerText,
                fieldLabel: m.formFieldLabel__emailAddress,
                fieldPlaceholder: m.formFieldInputPlaceholder__emailAddress,
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
                fieldLabel: m.formFieldLabel__password,
                fieldPlaceholder: m.formFieldInputPlaceholder__password,
                showPasswordLabel: m.formFieldAction__showPassword,
                hidePasswordLabel: m.formFieldAction__hidePassword,
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
            <ReverificationOTP
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
            <ReverificationOTP
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
            <ReverificationBackupCode
              focusRef={focusRef}
              messages={{
                title: m.backupCodeMfa.title,
                description: m.backupCodeMfa.subtitle,
                fieldLabel: m.formFieldLabel__backupCode,
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
            <ReverificationMethodPicker
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
            <ReverificationHelp
              messages={{
                title: m.alternativeMethods.getHelp.title,
                description: m.alternativeMethods.getHelp.content,
                backButton: m.backButton,
                supportButton: m.alternativeMethods.getHelp.blockButton__emailSupport,
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
                firstNameLabel: m.formFieldLabel__firstName,
                firstNamePlaceholder: m.formFieldInputPlaceholder__firstName,
                lastNameLabel: m.formFieldLabel__lastName,
                lastNamePlaceholder: m.formFieldInputPlaceholder__lastName,
                emailLabel: m.formFieldLabel__emailAddress,
                emailPlaceholder: m.formFieldInputPlaceholder__emailAddress,
                passwordLabel: m.formFieldLabel__password,
                passwordPlaceholder: m.formFieldInputPlaceholder__password,
                showPasswordLabel: m.formFieldAction__showPassword,
                hidePasswordLabel: m.formFieldAction__hidePassword,
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
            <ReverificationOTP
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
