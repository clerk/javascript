import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { Menu } from '../components/menu';
import { Spinner } from '../components/spinner';
import { userProfileConnectedAccountsMessages as m } from './user-profile-connected-accounts.messages';
import type { UserProfileConnectionProvider } from './user-profile-connected-accounts-section.view';
import { UserProfileConnectedProviderIcon } from './user-profile-connected-provider-icon';

export function UserProfileConnectAccountMenuView({
  providers,
  pendingProviderId,
  onConnect,
}: {
  providers: UserProfileConnectionProvider[];
  pendingProviderId?: string;
  onConnect: (id: string) => void;
}) {
  return (
    <Menu.Root placement='bottom-end'>
      <Menu.Trigger
        render={
          <Button
            size='sm'
            variant='outline'
            color='neutral'
          />
        }
      >
        {m.connect}
        <Icon
          name='chevron-down'
          size='sm'
          placement='inline-end'
        />
      </Menu.Trigger>
      <Menu.Popup>
        {providers.map(provider => (
          <Menu.Item
            key={provider.id}
            label={provider.provider}
            disabled={pendingProviderId !== undefined}
            aria-busy={provider.id === pendingProviderId || undefined}
            closeOnClick={false}
            onClick={() => onConnect(provider.id)}
          >
            <Menu.Media>
              {provider.id === pendingProviderId ? (
                <Spinner size='sm' />
              ) : (
                <UserProfileConnectedProviderIcon {...provider} />
              )}
            </Menu.Media>
            <Menu.Label>{provider.provider}</Menu.Label>
          </Menu.Item>
        ))}
      </Menu.Popup>
    </Menu.Root>
  );
}
