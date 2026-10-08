import { useClerk, useOrganization, useSession, useUser } from '@clerk/shared/react';
import type { OAuthStrategy, PhoneCodeChannel, Web3Strategy } from '@clerk/shared/types';

import { useEnabledThirdPartyProviders } from '../hooks';
import { useTotalEnabledAuthMethods } from '../hooks/useTotalEnabledAuthMethods';
import type { SocialButtonsRootProps } from './SocialButtons';

export type SocialStrategy = OAuthStrategy | Web3Strategy | PhoneCodeChannel;

export const useSocialButtonsModel = (props: SocialButtonsRootProps) => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { organization } = useOrganization();
  const providers = useEnabledThirdPartyProviders();
  const totalEnabledAuthMethods = useTotalEnabledAuthMethods();
  const strategies: SocialStrategy[] = [
    ...((props.enableOAuthProviders ?? true) ? providers.authenticatableOauthStrategies : []),
    ...((props.enableWeb3Providers ?? true) ? providers.web3Strategies : []),
    ...((props.enableAlternativePhoneCodeProviders ?? true) ? providers.alternativePhoneCodeChannels : []),
  ];
  const strategyToDisplayData = Object.fromEntries(
    strategies.map(strategy => [strategy, { ...providers.strategyToDisplayData[strategy] }]),
  ) as typeof providers.strategyToDisplayData;
  const clientLastAuth = props.showLastAuthenticationStrategy ? clerk.client?.lastAuthenticationStrategy : null;
  const convertedClientLastAuth = clientLastAuth?.startsWith('saml_')
    ? clientLastAuth.replace('saml_', 'oauth_')
    : clientLastAuth;
  const lastAuthenticationStrategy =
    convertedClientLastAuth && strategies.includes(convertedClientLastAuth as SocialStrategy)
      ? (convertedClientLastAuth as SocialStrategy)
      : null;
  const clientId = clerk.client?.id;
  const userId = user?.id;
  const sessionId = session?.id;
  const organizationId = organization?.id;
  return {
    requestKey: JSON.stringify([clientId, userId, sessionId, organizationId, strategies]),
    canRun: () =>
      clerk.client?.id === clientId &&
      clerk.user?.id === userId &&
      clerk.session?.id === sessionId &&
      clerk.organization?.id === organizationId,
    strategies,
    strategyToDisplayData,
    totalEnabledAuthMethods,
    lastAuthenticationStrategy,
  };
};
