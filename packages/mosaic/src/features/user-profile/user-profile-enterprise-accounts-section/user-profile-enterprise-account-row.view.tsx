import * as stylex from '@stylexjs/stylex';

import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { Spinner } from '../../../components/spinner';
import { fill, useMessages } from '../../../localization';
import { truncationStyles } from '../../../styles/typography.styles';
import { UserProfileProviderIcon } from '../user-profile-provider-icon';
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
  const m = useMessages('userProfileEnterpriseAccountsSection');
  return (
    <Section.Row xstyle={onConnect && styles.connectRow}>
      <Section.Item>
        <UserProfileProviderIcon {...account.icon} />
        <Section.Content>
          <Section.Label>
            <span
              title={account.name}
              {...stylex.props(truncationStyles.singleLine, styles.text)}
            >
              {account.name}
            </span>
            {account.requiresAction ? <Badge color='negative'>{m.requiresAction}</Badge> : null}
          </Section.Label>
          {account.emailAddress ? (
            <Section.Description
              title={account.emailAddress}
              xstyle={truncationStyles.singleLine}
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
                  name='arrow-up-right'
                  placement='inline-end'
                  size='sm'
                />
              )}
            </Button>
          </Section.Actions>
        ) : null}
      </Section.Item>
      <Section.Error>{onConnect ? account.connectError : undefined}</Section.Error>
    </Section.Row>
  );
}
