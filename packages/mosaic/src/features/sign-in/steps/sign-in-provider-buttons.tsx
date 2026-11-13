import * as stylex from '@stylexjs/stylex';

import { ProviderButton, ProviderButtonGroup } from '../../../components/provider-button';
import { fill, useMessages } from '../../../localization';
import { styles } from '../sign-in.styles';
import type { SignInProvider } from '../sign-in.types';
import { splitLastUsedProvider } from '../sign-in.utils';

interface SignInProviderButtonsProps {
  providers: readonly SignInProvider[];
  pendingProviderId?: string;
  lastUsedProviderId?: string;
  isDisabled: boolean;
  onSelectProvider: (id: string) => void;
}

export function SignInProviderButtons({
  providers,
  pendingProviderId,
  lastUsedProviderId,
  isDisabled,
  onSelectProvider,
}: SignInProviderButtonsProps) {
  const m = useMessages('signIn');
  const { lastUsed, others } = splitLastUsedProvider(providers, lastUsedProviderId);
  const providerButton = (provider: SignInProvider, badge?: string) => (
    <ProviderButton
      key={provider.id}
      icon={
        <img
          src={provider.iconUrl}
          alt=''
          {...stylex.props(styles.providerIcon)}
        />
      }
      longLabel={fill(m.start.socialButton, { provider: provider.name })}
      shortLabel={provider.name}
      badge={badge}
      isPending={pendingProviderId === provider.id}
      pendingLabel={m.verifying}
      onClick={() => onSelectProvider(provider.id)}
    />
  );

  return (
    <ProviderButtonGroup
      disabled={isDisabled}
      lastUsed={lastUsed ? providerButton(lastUsed, m.start.lastUsed) : undefined}
    >
      {others.map(provider => providerButton(provider))}
    </ProviderButtonGroup>
  );
}
