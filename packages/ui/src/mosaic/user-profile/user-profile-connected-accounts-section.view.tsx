import * as stylex from '@stylexjs/stylex';

import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { Section } from '../components/section';
import type { UserProfileMenuAction } from './user-profile-action-menu';
import { UserProfileActionMenu } from './user-profile-action-menu';
import { styles } from './user-profile-profile-panel.styles';

export interface UserProfileConnectedAccount {
  id: string;
  provider: string;
  identifier?: string;
  iconUrl?: string;
  connected?: boolean;
  canRemove?: boolean;
}

export interface UserProfileConnectedAccountsSectionViewProps {
  accounts: UserProfileConnectedAccount[];
  onConnect?: (id: string) => void;
  onManage?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function UserProfileConnectedAccountsSectionView({
  accounts,
  onConnect,
  onManage,
  onRemove,
}: UserProfileConnectedAccountsSectionViewProps) {
  return (
    <Section.Root>
      <Section.Title>Connected accounts</Section.Title>
      <Section.Group>
        {accounts.map(account => {
          const connected = account.connected ?? Boolean(account.identifier);
          const actions: UserProfileMenuAction[] = [];
          if (onRemove && account.canRemove !== false) {
            actions.push({ label: 'Remove', color: 'negative', onClick: () => onRemove(account.id) });
          } else if (!onRemove && onManage) {
            actions.push({ label: 'Manage', onClick: () => onManage(account.id) });
          }

          return (
            <Section.Row key={account.id}>
              <Section.Item>
                {account.iconUrl ? (
                  <Section.Media
                    size='xl'
                    {...stylex.props(styles.providerMedia)}
                  >
                    <img
                      alt=''
                      src={account.iconUrl}
                      {...stylex.props(styles.providerIcon)}
                    />
                  </Section.Media>
                ) : null}
                <Section.Content>
                  <Section.Label>{account.provider}</Section.Label>
                  {account.identifier ? <Section.Description>{account.identifier}</Section.Description> : null}
                </Section.Content>
                <Section.Actions>
                  {connected ? (
                    <UserProfileActionMenu
                      actions={actions}
                      label={`Manage ${account.provider}`}
                    />
                  ) : null}
                  {!connected && onConnect ? (
                    <Button
                      color='neutral'
                      size='sm'
                      variant='outline'
                      onClick={() => onConnect(account.id)}
                    >
                      Connect
                      <Icon
                        name='arrow-right-top'
                        placement='inline-end'
                        size='sm'
                      />
                    </Button>
                  ) : null}
                </Section.Actions>
              </Section.Item>
            </Section.Row>
          );
        })}
      </Section.Group>
    </Section.Root>
  );
}
