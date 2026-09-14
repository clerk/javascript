import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { Section } from '../components/section';
import { userProfileConnectedAccountsMessages as m } from './user-profile-connected-accounts.messages';
import { styles } from './user-profile-connected-accounts.styles';
import type { UserProfileConnectionProvider } from './user-profile-connected-accounts-section.view';
import { UserProfileConnectedProviderIcon } from './user-profile-connected-provider-icon';

export function UserProfileConnectAccountRowView({
  provider,
  onConnect,
}: {
  provider: UserProfileConnectionProvider;
  onConnect: (id: string) => void;
}) {
  return (
    <Section.Row xstyle={styles.connectRow}>
      <Section.Item>
        <Section.Media size='md'>
          <UserProfileConnectedProviderIcon {...provider} />
        </Section.Media>
        <Section.Content>
          <Section.Label>{provider.provider}</Section.Label>
        </Section.Content>
        <Section.Actions>
          <Button
            size='sm'
            variant='outline'
            color='neutral'
            aria-label={`${m.connect} ${provider.provider}`}
            onClick={() => onConnect(provider.id)}
          >
            {m.connect}
            <Icon
              name='arrow-right-top'
              placement='inline-end'
              size='sm'
            />
          </Button>
        </Section.Actions>
      </Section.Item>
      {provider.connectError ? <Section.Error>{provider.connectError}</Section.Error> : null}
    </Section.Row>
  );
}
