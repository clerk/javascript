import { ClerkRuntimeError } from '@clerk/shared/error';
import { __internal_useUserEnterpriseConnections, useClerk, useUser } from '@clerk/shared/react';
import type { EnterpriseAccountResource, EnterpriseConnectionResource, UserResource } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import { useMosaicRouter } from '../../../hooks/use-mosaic-router';
import type { ReverificationController } from '../../reverification';
import { useReverificationFlow } from '../../reverification';
import { withUserProfileModalReturn } from '../user-profile.modal-return';
import { useUserProfileOptions } from '../user-profile.provider';
import { isMonochromeProvider } from '../user-profile-provider.utils';
import type {
  EnterpriseAccountActionResult,
  UserProfileEnterpriseAccount,
  UserProfileEnterpriseConnection,
} from './user-profile-enterprise-accounts-section.types';

type Account = Pick<EnterpriseAccountResource, 'id' | 'emailAddress' | 'enterpriseConnectionId' | 'provider'> & {
  verification?: { error?: { longMessage?: string | null } | null } | null;
  enterpriseConnection: {
    active: boolean;
    name: string;
    logoPublicUrl?: string | null;
  } | null;
};

type Connection = Pick<EnterpriseConnectionResource, 'id' | 'name' | 'provider' | 'allowOrganizationAccountLinking'> & {
  logoPublicUrl?: string | null;
};

export type EnterpriseAccountsProjection =
  | { status: 'hidden' }
  | { status: 'ready'; accounts: UserProfileEnterpriseAccount[]; connections: UserProfileEnterpriseConnection[] };

export function projectEnterpriseAccounts({
  enabled,
  accounts,
  connections,
}: {
  enabled: boolean;
  accounts: readonly Account[];
  connections: readonly Connection[];
}): EnterpriseAccountsProjection {
  if (!enabled) {
    return { status: 'hidden' };
  }

  const linkedConnectionIds = new Set(accounts.map(account => account.enterpriseConnectionId));
  const visibleAccounts = accounts
    .filter(account => account.enterpriseConnection?.active)
    .map(account => ({
      id: account.id ?? '',
      name: account.enterpriseConnection?.name ?? '',
      iconUrl: account.enterpriseConnection?.logoPublicUrl ?? undefined,
      monochromeIcon: isMonochromeProvider(account.provider.replace(/^(oauth_|saml_)/, '').trim()),
      emailAddress: account.emailAddress,
      requiresAction: Boolean(account.verification?.error?.longMessage),
    }));
  const linkableConnections = connections
    .filter(connection => connection.allowOrganizationAccountLinking && !linkedConnectionIds.has(connection.id))
    .map(connection => ({
      id: connection.id,
      name: connection.name,
      iconUrl: connection.logoPublicUrl ?? undefined,
      monochromeIcon: isMonochromeProvider(connection.provider.replace(/^(oauth_|saml_)/, '').trim()),
    }));

  return visibleAccounts.length || linkableConnections.length
    ? { status: 'ready', accounts: visibleAccounts, connections: linkableConnections }
    : { status: 'hidden' };
}

export type UserProfileEnterpriseAccountsModel =
  | { status: 'loading' }
  | { status: 'hidden'; reason: 'no_user' | 'unavailable' }
  | {
      status: 'ready';
      userId: string;
      accounts: UserProfileEnterpriseAccount[];
      connections: UserProfileEnterpriseConnection[];
      connect: (connectionId: string) => Promise<EnterpriseAccountActionResult>;
      connectReverification: ReverificationController;
    };

export function useUserProfileEnterpriseAccountsModel(): UserProfileEnterpriseAccountsModel {
  const { mode } = useUserProfileOptions();
  const clerk = useClerk();
  const router = useMosaicRouter();
  const [createAccount, connectReverification] = useReverificationFlow(
    (current: UserResource, params: Parameters<UserResource['createExternalAccount']>[0]) =>
      current.createExternalAccount(params),
  );
  const { isLoaded, user } = useUser();
  const environment = useMosaicEnvironment();
  const { data: connections = [] } = __internal_useUserEnterpriseConnections({
    withOrganizationAccountLinking: true,
    keepPreviousData: false,
    enabled: Boolean(isLoaded && user && environment?.userSettings.enterpriseSSO.enabled),
  });

  if (!isLoaded || !environment) {
    return { status: 'loading' };
  }
  if (!user) {
    return { status: 'hidden', reason: 'no_user' };
  }

  const projection = projectEnterpriseAccounts({
    enabled: environment.userSettings.enterpriseSSO.enabled,
    accounts: user.enterpriseAccounts,
    connections,
  });
  if (projection.status === 'hidden') {
    return { status: 'hidden', reason: 'unavailable' };
  }

  const userId = user.id;

  const unavailable = () =>
    new ClerkRuntimeError('This enterprise connection is no longer available.', {
      code: 'enterprise_connection_unavailable',
    });

  const currentUser = () => {
    const current = clerk.user;
    if (!current || current.id !== userId) {
      throw unavailable();
    }
    return current;
  };

  return {
    ...projection,
    userId,
    connect: async connectionId => {
      const current = currentUser();
      if (!projection.connections.some(connection => connection.id === connectionId)) {
        throw unavailable();
      }
      const redirectUrl = withUserProfileModalReturn(window.location.href, mode);
      const account = await createAccount(current, { enterpriseConnectionId: connectionId, redirectUrl });
      currentUser();
      const redirect = account.verification?.externalVerificationRedirectURL;
      if (!redirect) {
        throw new ClerkRuntimeError('OAuth flow did not receive a verification URL.', {
          code: 'oauth_missing_verification_url',
        });
      }
      router.windowNavigate(redirect);
      return 'redirecting';
    },
    connectReverification,
  };
}
