/** @jsxImportSource @emotion/react */
import { AccountButton, type AccountButtonProps } from '@clerk/ui/mosaic/account/account-button.view';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './account-button.stories?raw';

export const meta: StoryMeta = {
  group: 'Account',
  title: 'AccountButton',
  source: 'packages/ui/src/mosaic/account/account-button.view.tsx',
};

// The view is presentational, so the fixtures drive every state. All callbacks are wired as
// no-ops purely so each affordance renders (an unhandled action hides its control).
const handlers = {
  onSelectOrganization: () => {},
  onSelectPersonal: () => {},
  onAcceptSuggestion: () => {},
  onAcceptInvitation: () => {},
  onSwitchAccount: () => {},
  onSignOutSession: () => {},
  onSignOutAll: () => {},
  onManageOrganization: () => {},
  onManageMembers: () => {},
  onManageAccount: () => {},
  onCreateOrganization: () => {},
  onAddAccount: () => {},
  onUpgrade: () => {},
} satisfies Partial<AccountButtonProps>;

const preston = { sessionId: 'sess_1', userId: 'user_1', name: 'Preston Booth', email: 'preston@clerk.dev' };

export function Default(_args: Record<string, unknown>) {
  return (
    <AccountButton
      {...handlers}
      status='ready'
      activeAccount={preston}
      activeOrganizationId='org_clerk_app'
      hasOrganizations
      memberships={[
        {
          kind: 'membership',
          organizationId: 'org_clerk_app',
          name: 'Clerk app',
          membersCount: 24,
          planLabel: 'Pro plan',
          upgradeable: true,
        },
        { kind: 'membership', organizationId: 'org_clerk_cloud', name: 'Clerk Cloud' },
      ]}
      suggestions={[
        { kind: 'suggestion', id: 'sug_labs', organizationId: 'org_clerk_labs', name: 'Clerk Labs', status: 'pending' },
      ]}
      invitations={[]}
      additionalAccounts={[{ sessionId: 'sess_2', userId: 'user_2', name: 'Preston Booth', email: 'acme@clerk.dev' }]}
    />
  );
}

export function Personal(_args: Record<string, unknown>) {
  return (
    <AccountButton
      {...handlers}
      status='ready'
      activeAccount={{
        sessionId: 'sess_cam',
        userId: 'user_cam',
        name: 'Cameron Walker',
        email: 'cameron.walker@gmail.com',
      }}
      activeOrganizationId={null}
      hasOrganizations={false}
      memberships={[]}
      suggestions={[]}
      invitations={[]}
      additionalAccounts={[
        { sessionId: 'sess_js', userId: 'user_js', name: 'Jeremy Sallee', email: 'jsallee@gmail.com' },
      ]}
    />
  );
}

export function MultipleAccounts(_args: Record<string, unknown>) {
  return (
    <AccountButton
      {...handlers}
      status='ready'
      activeAccount={preston}
      activeOrganizationId='org_clerk_app'
      hasOrganizations
      memberships={[
        {
          kind: 'membership',
          organizationId: 'org_clerk_app',
          name: 'Clerk app',
          membersCount: 24,
          planLabel: 'Pro plan',
          upgradeable: true,
        },
        { kind: 'membership', organizationId: 'org_clerk_cloud', name: 'Clerk Cloud' },
      ]}
      suggestions={[]}
      invitations={[]}
      additionalAccounts={[
        { sessionId: 'sess_cam', userId: 'user_cam', name: 'Cameron Walker', email: 'cameron.walker@gmail.com' },
      ]}
    />
  );
}
