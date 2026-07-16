/** @jsxImportSource @emotion/react */
import { UserButton, type UserButtonProps } from '@clerk/ui/mosaic/components/user-button.view';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './user-button.stories?raw';

export const meta: StoryMeta = {
  group: 'User',
  title: 'UserButton',
  source: 'packages/ui/src/mosaic/components/user-button.view.tsx',
};

// The view is presentational, so the fixtures drive every state. All callbacks are wired as
// no-ops purely so each affordance renders (an unhandled action hides its control).
const handlers = {
  onSelectOrganization: () => {},
  onSelectPersonal: () => {},
  onAcceptSuggestion: () => {},
  onAcceptInvitation: () => {},
  onSwitchSession: () => {},
  onSignOutSession: () => {},
  onSignOutAll: () => {},
  onManageOrganization: () => {},
  onManageMembers: () => {},
  onManageAccount: () => {},
  onCreateOrganization: () => {},
  onAddAccount: () => {},
  onUpgrade: () => {},
} satisfies Partial<UserButtonProps>;

const preston = { sessionId: 'sess_1', userId: 'user_1', name: 'Preston Booth', email: 'preston@clerk.dev' };

export function Default(_args: Record<string, unknown>) {
  return (
    <UserButton
      {...handlers}
      status='ready'
      activeSession={preston}
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
      additionalSessions={[{ sessionId: 'sess_2', userId: 'user_2', name: 'Preston Booth', email: 'acme@clerk.dev' }]}
    />
  );
}

export function Personal(_args: Record<string, unknown>) {
  return (
    <UserButton
      {...handlers}
      status='ready'
      activeSession={{
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
      additionalSessions={[
        { sessionId: 'sess_js', userId: 'user_js', name: 'Jeremy Sallee', email: 'jsallee@gmail.com' },
      ]}
    />
  );
}

export function MultipleSessions(_args: Record<string, unknown>) {
  return (
    <UserButton
      {...handlers}
      status='ready'
      activeSession={preston}
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
      additionalSessions={[
        { sessionId: 'sess_cam', userId: 'user_cam', name: 'Cameron Walker', email: 'cameron.walker@gmail.com' },
      ]}
    />
  );
}
