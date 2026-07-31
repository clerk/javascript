/** @jsxImportSource @emotion/react */
import { UserButton, type UserButtonProps } from '@clerk/ui/mosaic/user-button/user-button.view';
import { useState } from 'react';

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
  onInviteMembers: () => {},
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

const workspaces = {
  activeOrganizationId: 'org_clerk_app',
  hasOrganizations: true,
  memberships: [
    {
      kind: 'membership',
      organizationId: 'org_clerk_app',
      name: 'Clerk app',
      membersCount: 24,
      planLabel: 'Pro plan',
      imageUrl: clerkLogo,
    },
    { kind: 'membership', organizationId: 'org_clerk_cloud', name: 'Clerk Cloud', imageUrl: clerkLogo },
  ],
  suggestions: [
    {
      kind: 'suggestion',
      id: 'sug_labs',
      organizationId: 'org_clerk_labs',
      name: 'Clerk Labs',
      status: 'pending',
      imageUrl: clerkLogo,
    },
  ],
  invitations: [],
} satisfies Partial<UserButtonProps>;

export function Combined(_args: Record<string, unknown>) {
  return (
    <UserButton
      {...handlers}
      {...workspaces}
      mode='combined'
      status='ready'
      activeSession={colin}
      additionalSessions={[braden]}
    />
  );
}

export function Organizations(_args: Record<string, unknown>) {
  return (
    <UserButton
      {...handlers}
      {...workspaces}
      mode='orgs'
      status='ready'
      activeSession={colin}
      // Present, and deliberately not rendered: an org switcher carries no account rows.
      additionalSessions={[braden]}
    />
  );
}

const sessions = [colin, braden];

// The one story wired to real state: picking an account makes it the active one and closes the
// popover, so the switch is visible on the trigger rather than described in prose.
export function User(_args: Record<string, unknown>) {
  const [open, setOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(colin.sessionId);
  const activeSession = sessions.find(session => session.sessionId === activeSessionId) ?? colin;

  return (
    <UserButton
      {...handlers}
      open={open}
      onOpenChange={setOpen}
      onSwitchSession={sessionId => {
        setActiveSessionId(sessionId);
        setOpen(false);
      }}
      mode='user'
      status='ready'
      activeSession={activeSession}
      activeOrganizationId={null}
      hasOrganizations={false}
      memberships={[]}
      suggestions={[]}
      invitations={[]}
      additionalSessions={sessions.filter(session => session.sessionId !== activeSessionId)}
    />
  );
}
