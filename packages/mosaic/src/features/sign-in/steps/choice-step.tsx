import type { Ref } from 'react';

import type { VerificationMethodPickerMessages } from '../../../blocks/verification';
import { VerificationMethodPicker } from '../../../blocks/verification';
import type { IconComponent } from '../../../icons/glyph';
import { Envelope } from '../../../icons/glyphs/envelope';
import { Key } from '../../../icons/glyphs/key';
import { SecurityLockSquare } from '../../../icons/glyphs/security-lock-square';
import { SecurityPasskey } from '../../../icons/glyphs/security-passkey';
import { SecurityPhone } from '../../../icons/glyphs/security-phone';
import type { SignInFactor, SignInProvider, SignInStep } from '../sign-in.types';
import { SignInAccounts } from './sign-in-accounts';
import { SignInAlternativeMethods } from './sign-in-alternative-methods';
import { SignInEnterpriseConnections } from './sign-in-enterprise-connections';
import { SignInWallets } from './sign-in-wallets';

const factorIcon = {
  password: SecurityLockSquare,
  passkey: SecurityPasskey,
  email_code: Envelope,
  email_link: Envelope,
  phone_code: SecurityPhone,
  totp: SecurityLockSquare,
  backup_code: Key,
  reset_password_email_code: Envelope,
  reset_password_phone_code: SecurityPhone,
} as const satisfies Record<SignInFactor['strategy'], IconComponent>;

interface ChoiceStepProps {
  step: Extract<SignInStep, { kind: 'choice' }>;
  messages: VerificationMethodPickerMessages;
  factorLabel: (factor: SignInFactor) => string;
  pendingFactorId?: string;
  onSelectFactor: (id: string) => void;
  onShowHelp: () => void;
  onBack: () => void;
  onStartOver: () => void;
  logo?: { src: string; alt: string };
  globalErrorMessage?: string;
  socialProviders: readonly SignInProvider[];
  pendingProviderId?: string;
  onSelectProvider: (id: string) => void;
  onCancel?: () => void;
  pendingAccountId?: string;
  isDisabled: boolean;
  onSelectAccount: (id: string) => void;
  onAddAccount?: () => void;
  onSignOutAll?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function ChoiceStep({
  step,
  messages,
  factorLabel,
  pendingFactorId,
  onSelectFactor,
  onShowHelp,
  onBack,
  onStartOver,
  logo,
  globalErrorMessage,
  socialProviders,
  pendingProviderId,
  onSelectProvider,
  onCancel,
  pendingAccountId,
  isDisabled,
  onSelectAccount,
  onAddAccount,
  onSignOutAll,
  focusRef,
}: ChoiceStepProps) {
  if (step.purpose === 'wallets') {
    return (
      <SignInWallets
        focusRef={focusRef}
        wallets={step.options}
        loading={step.loading}
        globalErrorMessage={globalErrorMessage}
        pendingWalletId={pendingProviderId}
        isDisabled={isDisabled}
        onSelectWallet={onSelectProvider}
        onBack={onBack}
      />
    );
  }

  if (step.purpose === 'accounts') {
    return (
      <SignInAccounts
        focusRef={focusRef}
        accounts={step.options}
        globalErrorMessage={globalErrorMessage}
        pendingAccountId={pendingAccountId}
        isDisabled={isDisabled}
        onSelectAccount={onSelectAccount}
        onAddAccount={onAddAccount}
        onSignOutAll={onSignOutAll}
      />
    );
  }

  if (step.purpose === 'enterprise-connections') {
    return (
      <SignInEnterpriseConnections
        focusRef={focusRef}
        logo={logo}
        connections={step.options}
        globalErrorMessage={globalErrorMessage}
        pendingConnectionId={pendingProviderId}
        onSelectConnection={onSelectProvider}
        onCancel={onCancel}
      />
    );
  }

  const methods = step.options.map(factor => ({
    id: factor.id,
    label: factorLabel(factor),
    icon: factorIcon[factor.strategy],
  }));

  if (step.purpose === 'methods') {
    return (
      <SignInAlternativeMethods
        focusRef={focusRef}
        title={messages.title}
        description={messages.description}
        methods={methods}
        pendingMethodId={pendingFactorId}
        onSelectMethod={onSelectFactor}
        socialProviders={socialProviders}
        pendingProviderId={pendingProviderId}
        onSelectProvider={onSelectProvider}
        isDisabled={isDisabled}
        globalErrorMessage={globalErrorMessage}
        onBack={step.canGoBack === false ? undefined : onBack}
        onStartOver={step.canStartOver ? onStartOver : undefined}
        onShowHelp={onShowHelp}
      />
    );
  }

  return (
    <VerificationMethodPicker
      focusRef={focusRef}
      messages={messages}
      methods={methods}
      pendingMethodId={pendingFactorId}
      onSelect={onSelectFactor}
      onHelp={onShowHelp}
      onBack={onBack}
    />
  );
}
