import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';

import type { ClerkSessionsHost } from './clerk';
import type { LoomClient } from './client';
import type { ProfileActionOptions, ProfileActions } from './profile-actions-types';
import type { ProfileEnvironment } from './profile-host-types';
import type { EnterpriseConnection } from './types';

export function enterpriseActions(
  owner: LoomClient,
  current: () => NonNullable<ClerkSessionsHost['user']>,
  environment: () => ProfileEnvironment,
  navigate: (url: string) => Promise<void>,
  options: ProfileActionOptions,
): ProfileActions['enterprise'] {
  const enabled = environment().userSettings.enterpriseSSO.enabled;
  const user = current();
  return {
    available: enabled && Boolean(user.createExternalAccount),
    connect:
      enabled && user.createExternalAccount
        ? async connectionId => {
            await owner.mutateProfile(async () => {
              const target = current();
              const connections = owner.queryClient.getQueryData<readonly EnterpriseConnection[]>(
                owner.enterpriseConnectionsQueryOptions().queryKey,
              );
              const connection = connections?.find(item => item.id === connectionId);
              if (
                !environment().userSettings.enterpriseSSO.enabled ||
                !connection?.allowOrganizationAccountLinking ||
                target.enterpriseAccounts?.some(account => account.enterpriseConnectionId === connectionId)
              ) {
                throw new Error('Enterprise connection unavailable.');
              }
              if (!target.createExternalAccount) {
                throw new Error('Enterprise connection unavailable.');
              }
              const url = window.location.href;
              const redirectUrl =
                options.mode === 'modal' ? appendModalState({ url, componentName: 'UserProfile' }) : url;
              const account = await target.createExternalAccount({ enterpriseConnectionId: connectionId, redirectUrl });
              current();
              const redirect = account.verification?.externalVerificationRedirectURL;
              if (!redirect) {
                throw new Error('Enterprise connection did not return a redirect URL.');
              }
              await navigate(redirect.href);
            });
            return 'redirecting';
          }
        : undefined,
  };
}
