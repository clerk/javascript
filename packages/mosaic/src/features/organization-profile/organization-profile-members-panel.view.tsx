import * as stylex from '@stylexjs/stylex';

import { panelStyles, Profile } from '../../components/profile';
import { Tabs } from '../../components/tabs';
import { useMessages } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import type { MembersTableTabViewProps } from './members-table-tab.types';
import { MembersTableTabView } from './members-table-tab.view';

export interface OrganizationProfileMembersPanelViewProps {
  members?: MembersTableTabViewProps;
}

export function OrganizationProfileMembersPanelView({ members }: OrganizationProfileMembersPanelViewProps) {
  const m = useMessages('organizationProfile');
  const membersMessages = useMessages('membersTableTab');
  const tabs = [
    {
      id: 'members',
      label: membersMessages.title,
      content: members ? <MembersTableTabView {...members} /> : null,
    },
  ].filter(tab => tab.content !== null);

  return (
    <div {...mergeStyleProps(themeProps('organization-profile-members-panel'), stylex.props(panelStyles.root))}>
      <Profile.PageTitle>{m.pages.members}</Profile.PageTitle>
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
    </div>
  );
}
