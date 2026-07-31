/** @jsxImportSource @emotion/react */
import { UserButton, type UserButtonProps } from '@clerk/ui/mosaic/user-button/user-button.view';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './user-button.stories?raw';

export const meta: StoryMeta = {
  group: 'User',
  title: 'UserButton',
  source: 'packages/ui/src/mosaic/user-button/user-button.view.tsx',
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

// Workspaces wear the Clerk mark; each account gets its own photo so two signed-in
// accounts are never mistaken for one.
const clerkLogo = 'https://avatars.githubusercontent.com/u/49538330?v=4';

const colin = {
  sessionId: 'sess_colin',
  userId: 'user_colin',
  name: 'Colin',
  email: 'colin@clerk.dev',
  imageUrl: 'https://avatars.githubusercontent.com/u/51144033?v=4',
};

const braden = {
  sessionId: 'sess_braden',
  userId: 'user_braden',
  name: 'Braden',
  email: 'braden@clerk.dev',
  imageUrl: 'https://avatars.githubusercontent.com/u/64913815?v=4',
};

export function Default(_args: Record<string, unknown>) {
  return (
    <UserButton
      {...handlers}
      status='ready'
      activeSession={colin}
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
          imageUrl: clerkLogo,
        },
        { kind: 'membership', organizationId: 'org_clerk_cloud', name: 'Clerk Cloud', imageUrl: clerkLogo },
      ]}
      suggestions={[
        {
          kind: 'suggestion',
          id: 'sug_labs',
          organizationId: 'org_clerk_labs',
          name: 'Clerk Labs',
          status: 'pending',
          imageUrl: clerkLogo,
        },
      ]}
      invitations={[]}
      additionalSessions={[braden]}
    />
  );
}

export function Personal(_args: Record<string, unknown>) {
  return (
    <UserButton
      {...handlers}
      status='ready'
      activeSession={colin}
      activeOrganizationId={null}
      hasOrganizations={false}
      memberships={[]}
      suggestions={[]}
      invitations={[]}
      additionalSessions={[braden]}
    />
  );
}

export function MultipleSessions(_args: Record<string, unknown>) {
  return (
    <UserButton
      {...handlers}
      status='ready'
      activeSession={colin}
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
          imageUrl: clerkLogo,
        },
        { kind: 'membership', organizationId: 'org_clerk_cloud', name: 'Clerk Cloud', imageUrl: clerkLogo },
      ]}
      suggestions={[]}
      invitations={[]}
      additionalSessions={[braden]}
    />
  );
}
