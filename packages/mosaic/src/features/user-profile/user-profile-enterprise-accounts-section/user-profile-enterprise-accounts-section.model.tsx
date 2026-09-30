import { isClerkAPIResponseError } from '@clerk/shared/error';
import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import { windowNavigate } from '@clerk/shared/internal/clerk-js/windowNavigate';
import { __internal_useUserEnterpriseConnections, useClerk, useUser } from '@clerk/shared/react';
import type { EnterpriseAccountResource, EnterpriseConnectionResource } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../../hooks/useMosaicEnvironment';
import { useMessages } from '../../../localization';
import type {
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

export function useUserProfileEnterpriseAccountsModel({ mode }: { mode?: 'modal' | 'mounted' } = {}) {
  const clerk = useClerk();
  const { isLoaded, user } = useUser();
  const environment = useMosaicEnvironment();
  const { data: connections = [] } = __internal_useUserEnterpriseConnections({
    withOrganizationAccountLinking: true,
    enabled: Boolean(isLoaded && user && environment?.userSettings.enterpriseSSO.enabled),
  });
  const messages = useMessages('userProfileEnterpriseAccountsSection');

  if (!isLoaded || !environment) {
    return { status: 'loading' } as const;
  }
  if (!user) {
    return { status: 'hidden' } as const;
  }

  const projection = projectEnterpriseAccounts({
    enabled: environment.userSettings.enterpriseSSO.enabled,
    accounts: user.enterpriseAccounts,
    connections,
  });
  if (projection.status === 'hidden') {
    return projection;
  }

  // TODO: Add session reverification for enterprise account linking; surface API errors until then.
  const connect = async (connectionId: string): Promise<'redirecting' | void> => {
    if (!projection.connections.some(connection => connection.id === connectionId)) {
      throw new Error(messages.errors.generic);
    }
    const url = window.location.href;
    const redirectUrl = mode === 'modal' ? appendModalState({ url, componentName: 'UserProfile' }) : url;
    let account: Awaited<ReturnType<typeof user.createExternalAccount>>;
    try {
      account = await user.createExternalAccount({ enterpriseConnectionId: connectionId, redirectUrl });
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        const first = error.errors[0];
        throw new Error(first?.longMessage || first?.message || messages.errors.generic);
      }
      throw new Error(messages.errors.generic);
    }
    const redirect = account?.verification?.externalVerificationRedirectURL;
    if (!redirect) {
      throw new Error(messages.errors.missingRedirect);
    }
    if (typeof clerk.__internal_windowNavigate === 'function') {
      clerk.__internal_windowNavigate(redirect);
    } else {
      windowNavigate(redirect);
    }
    return 'redirecting';
  };

  return { ...projection, onConnect: connect };
}

export type UserProfileEnterpriseAccountsModel = ReturnType<typeof useUserProfileEnterpriseAccountsModel>;
