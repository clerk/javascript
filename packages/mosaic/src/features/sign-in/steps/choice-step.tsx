import type { Ref } from 'react';

import { AuthEnterpriseConnections, AuthWallets } from '../../../blocks/auth';
import { VerificationMethodPicker } from '../../../blocks/verification';
import { useMessages } from '../../../localization';
import type { SignInStep } from '../sign-in.types';
import { choiceCopy, factorButtonLabel, factorRow, groupedFactors, passkeyFirst } from '../sign-in.utils';
import { factorIcon } from './factor-icon';
import { SignInAccounts } from './sign-in-accounts';
import { SignInAddressPicker } from './sign-in-address-picker';
import { SignInAlternativeMethods } from './sign-in-alternative-methods';

interface ChoiceStepProps {
  step: Extract<SignInStep, { kind: 'choice' }>;
  pendingFactorId?: string;
  onSelectFactor: (id: string) => void;
  onShowHelp: () => void;
  onBack: () => void;
  logo?: { src: string; alt: string };
  globalErrorMessage?: string;
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
  pendingFactorId,
  onSelectFactor,
  onShowHelp,
  onBack,
  logo,
  globalErrorMessage,
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
  const m = useMessages('signIn');

  if (step.purpose === 'wallets') {
    return (
      <AuthWallets
        focusRef={focusRef}
        messages={{ ...m.wallets, backButton: m.back, pendingLabel: m.verifying, loading: m.loading }}
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
      <AuthEnterpriseConnections
        focusRef={focusRef}
        messages={{
          title: m.enterpriseConnections.title,
          description: m.enterpriseConnections.description,
          pendingLabel: m.enterpriseSso.pending,
          secondaryActionLabel: m.enterpriseSso.bypass,
        }}
        logo={logo}
        connections={step.options}
        globalErrorMessage={globalErrorMessage}
        pendingConnectionId={pendingProviderId}
        onSelectConnection={onSelectProvider}
        onCancel={onCancel}
      />
    );
  }

  const copy = choiceCopy(step, m);
  if (step.purpose === 'addresses') {
    return (
      <SignInAddressPicker
        focusRef={focusRef}
        title={copy.title}
        description={copy.description}
        options={step.options}
        pendingFactorId={pendingFactorId}
        onSelectFactor={onSelectFactor}
        isDisabled={isDisabled}
        globalErrorMessage={globalErrorMessage}
        onBack={onBack}
      />
    );
  }

  const groups = groupedFactors(step.options);

  if (step.purpose === 'methods') {
    return (
      <SignInAlternativeMethods
        focusRef={focusRef}
        title={copy.title}
        description={copy.description}
        methods={passkeyFirst(groups).map(({ factor, count }) => ({
          id: factor.id,
          label: factorButtonLabel(factor, m),
          description: factorRow(factor, m, count).description,
          icon: factorIcon[factor.strategy],
        }))}
        pendingMethodId={pendingFactorId}
        onSelectMethod={onSelectFactor}
        isDisabled={isDisabled}
        globalErrorMessage={globalErrorMessage}
        onBack={step.canGoBack === false ? undefined : onBack}
        onShowHelp={onShowHelp}
      />
    );
  }

  return (
    <VerificationMethodPicker
      focusRef={focusRef}
      messages={{
        ...copy,
        backButton: m.alternativeMethods.back,
        helpText: m.alternativeMethods.helpPrompt,
        helpButton: m.alternativeMethods.helpLink,
      }}
      methods={groups.map(({ factor, count }) => ({
        id: factor.id,
        ...factorRow(factor, m, count),
        icon: factorIcon[factor.strategy],
      }))}
      pendingMethodId={pendingFactorId}
      onSelect={onSelectFactor}
      onHelp={onShowHelp}
      onBack={onBack}
    />
  );
}
