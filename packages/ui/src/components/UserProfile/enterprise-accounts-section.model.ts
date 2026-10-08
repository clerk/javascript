import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import { __internal_useUserEnterpriseConnections, useClerk, useReverification, useUser } from '@clerk/shared/react';
import { useRef } from 'react';

import { getEnterpriseProviderIconId } from '@/ui/common';
import { useUserProfileContext } from '@/ui/contexts';
import { clerkWindowNavigate } from '@/ui/utils/windowNavigate';

import { getExternalVerificationRedirectURL } from './oauthTransport';
import { useProfileRequestScopeModel } from './profile-request-scope.model';

export type EnterpriseConnectionRow = {
  id: string;
  name: string;
  providerIconId: ReturnType<typeof getEnterpriseProviderIconId>;
  providerIconUrl: string;
};

export const useEnterpriseAccountsSectionModel = () => {
  const clerk = useClerk();
  const { user } = useUser();
  const { componentName, mode } = useUserProfileContext();
  const scope = useProfileRequestScopeModel('enterprise-accounts');
  const { data: userEnterpriseConnections = [] } = __internal_useUserEnterpriseConnections({
    withOrganizationAccountLinking: true,
    keepPreviousData: false,
  });
  const connections = useRef(userEnterpriseConnections);
  connections.current = userEnterpriseConnections;
  const resolve = (connectionId: string) =>
    scope.canRun() && !clerk.user?.enterpriseAccounts.some(account => account.enterpriseConnectionId === connectionId)
      ? connections.current.find(
          connection => connection.id === connectionId && connection.allowOrganizationAccountLinking,
        )
      : undefined;
  const createExternalAccount = useReverification((connectionId: string, isCurrent: () => boolean) => {
    if (!isCurrent() || !resolve(connectionId)) {
      return undefined;
    }
    const redirectUrl =
      mode === 'modal' ? appendModalState({ url: window.location.href, componentName }) : window.location.href;
    return clerk.user?.createExternalAccount({ enterpriseConnectionId: connectionId, redirectUrl });
  });
  const activeAccounts = user?.enterpriseAccounts.filter(({ enterpriseConnection }) => enterpriseConnection?.active);
  const linkableConnections = user
    ? userEnterpriseConnections.filter(
        connection =>
          connection.allowOrganizationAccountLinking &&
          !user.enterpriseAccounts.some(account => account.enterpriseConnectionId === connection.id),
      )
    : [];

  return {
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    shouldRender: Boolean(activeAccounts?.length || linkableConnections.length),
    accounts: activeAccounts?.map(account => {
      const providerId = getEnterpriseProviderIconId(account.provider);
      const providerName = account.enterpriseConnection?.name ?? providerId;
      return {
        id: account.id ?? '',
        label: account.emailAddress,
        connectionName: account.enterpriseConnection?.name,
        hasError: Boolean(account.verification?.error?.longMessage),
        providerId,
        providerIconUrl: account.enterpriseConnection?.logoPublicUrl,
        providerName,
        provider: account.provider,
      };
    }),
    linkableConnections: linkableConnections.map(
      (connection): EnterpriseConnectionRow => ({
        id: connection.id,
        name: connection.name,
        providerIconId: getEnterpriseProviderIconId(connection.provider),
        providerIconUrl: connection.logoPublicUrl?.trim() || '',
      }),
    ),
    connect: async (connectionId: string, canContinue: () => boolean): Promise<boolean> => {
      const isCurrent = () => scope.canRun() && canContinue();
      if (!isCurrent() || !resolve(connectionId)) {
        return false;
      }
      try {
        const result = await createExternalAccount(connectionId, isCurrent);
        if (!isCurrent() || !resolve(connectionId)) {
          return false;
        }
        const url = getExternalVerificationRedirectURL(result);
        clerkWindowNavigate(clerk, url);
        return isCurrent();
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
        return false;
      }
    },
  };
};
