import type { MouseEventHandler } from 'react';

import { Panel } from '../../components/panel';
import { Tabs } from '../../components/tabs';
import { useMessages } from '../../localization';
import { themeProps } from '../../props';
import type { InvitationsTableTabViewProps } from './invitations-table-tab.types';
import { InvitationsTableTabView } from './invitations-table-tab.view';
import type { MembersTableTabViewProps } from './members-table-tab.types';
import { MembersTableTabView } from './members-table-tab.view';
import type { OrganizationProfileInviteMembersDialogProps } from './organization-profile-invite-members.dialog';
import { OrganizationProfileInviteMembersDialog } from './organization-profile-invite-members.dialog';
import type { RequestsTableTabViewProps } from './requests-table-tab.types';
import { RequestsTableTabView } from './requests-table-tab.view';

export interface OrganizationProfileMembersPanelViewProps {
  members?: MembersTableTabViewProps;
  invitations?: InvitationsTableTabViewProps;
  requests?: RequestsTableTabViewProps;
  onInvite?: MouseEventHandler<HTMLButtonElement>;
  inviteDialog?: OrganizationProfileInviteMembersDialogProps;
}

export function OrganizationProfileMembersPanelView({
  members,
  invitations,
  requests,
  onInvite,
  inviteDialog,
}: OrganizationProfileMembersPanelViewProps) {
  const m = useMessages('organizationProfile');
  const membersMessages = useMessages('membersTableTab');
  const invitationsMessages = useMessages('invitationsTableTab');
  const requestsMessages = useMessages('requestsTableTab');
  const tabs = [
    {
      id: 'members',
      label: membersMessages.title,
      content: members ? (
        <MembersTableTabView
          {...members}
          onInvite={onInvite ?? members.onInvite}
        />
      ) : null,
    },
    {
      id: 'invitations',
      label: invitationsMessages.title,
      content: invitations ? (
        <InvitationsTableTabView
          {...invitations}
          onInvite={onInvite ?? invitations.onInvite}
        />
      ) : null,
    },
    {
      id: 'requests',
      label: requestsMessages.title,
      content: requests ? (
        <RequestsTableTabView
          {...requests}
          onInvite={onInvite ?? requests.onInvite}
        />
      ) : null,
    },
  ].filter(tab => tab.content !== null);

  return (
    <Panel.Root render={<div {...themeProps('organization-profile-members-panel')} />}>
      <Panel.Title>{m.pages.members}</Panel.Title>
      {tabs.length > 0 ? (
        <Tabs.Root defaultValue={tabs[0]?.id}>
          <Tabs.List aria-label={m.pages.members}>
            {tabs.map(tab => (
              <Tabs.Tab
                key={tab.id}
                value={tab.id}
              >
                {tab.label}
              </Tabs.Tab>
            ))}
            <Tabs.Indicator />
          </Tabs.List>
          {tabs.map(tab => (
            <Tabs.Panel
              key={tab.id}
              value={tab.id}
            >
              {tab.content}
            </Tabs.Panel>
          ))}
        </Tabs.Root>
      ) : null}
      {inviteDialog ? <OrganizationProfileInviteMembersDialog {...inviteDialog} /> : null}
    </Panel.Root>
  );
}
