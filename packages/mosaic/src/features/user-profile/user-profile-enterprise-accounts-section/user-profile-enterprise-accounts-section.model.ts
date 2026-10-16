import { ClerkRuntimeError } from '@clerk/shared/error';
import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import { __internal_useUserEnterpriseConnections, useClerk, useUser } from '@clerk/shared/react';
import type { EnterpriseAccountResource, EnterpriseConnectionResource } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import { useMosaicRouter } from '../../../hooks/use-mosaic-router';
import { useUserProfileOptions } from '../user-profile.provider';
import type {
  EnterpriseAccountActionResult,
  UserProfileEnterpriseAccount,
  UserProfileEnterpriseConnection,
} from './user-profile-enterprise-accounts-section.types';

type Account = Pick<EnterpriseAccountResource, 'id' | 'emailAddress' | 'enterpriseConnectionId'> & {
  verification?: { error?: { longMessage?: string | null } | null } | null;
  enterpriseConnection: {
    active: boolean;
    name: string;
    logoPublicUrl?: string | null;
  } | null;
};

type Connection = Pick<EnterpriseConnectionResource, 'id' | 'name' | 'allowOrganizationAccountLinking'> & {
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
      emailAddress: account.emailAddress,
      requiresAction: Boolean(account.verification?.error?.longMessage),
    }));
  const linkableConnections = connections
    .filter(connection => connection.allowOrganizationAccountLinking && !linkedConnectionIds.has(connection.id))
    .map(connection => ({ id: connection.id, name: connection.name, iconUrl: connection.logoPublicUrl ?? undefined }));

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
    };

export function useUserProfileEnterpriseAccountsModel(): UserProfileEnterpriseAccountsModel {
  const { mode } = useUserProfileOptions();
  const clerk = useClerk();
  const router = useMosaicRouter();
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
      const url = window.location.href;
      const redirectUrl = mode === 'modal' ? appendModalState({ url, componentName: 'UserProfile' }) : url;
      const account = await current.createExternalAccount({ enterpriseConnectionId: connectionId, redirectUrl });
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
  };
}
