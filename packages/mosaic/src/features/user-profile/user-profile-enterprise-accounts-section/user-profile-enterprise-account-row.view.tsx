import * as stylex from '@stylexjs/stylex';

import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Icon, IconFrame } from '../../../components/icon';
import { Section } from '../../../components/section';
import { Spinner } from '../../../components/spinner';
import { fill } from '../../../utils/messages';
import { userProfileEnterpriseAccountsMessages as m } from './user-profile-enterprise-accounts-section.messages';
import { styles } from './user-profile-enterprise-accounts-section.styles';
import type { UserProfileEnterpriseAccount } from './user-profile-enterprise-accounts-section.types';

export function UserProfileEnterpriseAccountRowView({
  account,
  onConnect,
  isPending,
  disabled,
}: {
  account: UserProfileEnterpriseAccount;
  onConnect?: (id: string) => void;
  isPending?: boolean;
  disabled?: boolean;
}) {
  const iconUrl = account.iconUrl?.trim();
  return (
    <Section.Row xstyle={onConnect && styles.connectRow}>
      <Section.Item>
        <Section.Media size='lg'>
          <IconFrame>
            {iconUrl ? (
              <img
                src={iconUrl}
                alt=''
                aria-hidden
                {...stylex.props(styles.icon)}
              />
            ) : (
              <span
                aria-hidden
                {...stylex.props(styles.fallback)}
              >
                {account.name.trim().charAt(0).toUpperCase()}
              </span>
            )}
          </IconFrame>
        </Section.Media>
        <Section.Content>
          <Section.Label xstyle={styles.label}>
            <span
              title={account.name}
              {...stylex.props(styles.text)}
            >
              {account.name}
            </span>
            {account.requiresAction ? <Badge color='negative'>{m.requiresAction}</Badge> : null}
          </Section.Label>
          {account.emailAddress ? (
            <Section.Description
              title={account.emailAddress}
              xstyle={styles.text}
            >
              {account.emailAddress}
            </Section.Description>
          ) : null}
        </Section.Content>
        {onConnect ? (
          <Section.Actions>
            <Button
              color='neutral'
              size='sm'
              variant='outline'
              aria-label={fill(m.connectProvider, { provider: account.name })}
              aria-busy={isPending || undefined}
              disabled={disabled}
              onClick={() => onConnect(account.id)}
            >
              {m.connect}
              {isPending ? (
                <Spinner size='sm' />
              ) : (
                <Icon
                  name='arrow-right-top'
                  placement='inline-end'
                  size='sm'
                />
              )}
            </Button>
          </Section.Actions>
        ) : null}
      </Section.Item>
      {onConnect && account.connectError ? <Section.Error>{account.connectError}</Section.Error> : null}
    </Section.Row>
  );
}
