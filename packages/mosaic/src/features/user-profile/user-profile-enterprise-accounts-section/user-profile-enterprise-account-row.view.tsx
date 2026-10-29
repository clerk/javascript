import * as stylex from '@stylexjs/stylex';

import { Badge } from '../../../components/badge';
import { SubmitButton } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { ArrowUpRight } from '../../../icons/glyphs/arrow-up-right';
import { fill, useMessages } from '../../../localization';
import { truncationStyles } from '../../../styles/typography.styles';
import { UserProfileProviderMedia } from '../user-profile-provider-media';
import { styles } from './user-profile-enterprise-accounts-section.styles';
import type { UserProfileEnterpriseAccount } from './user-profile-enterprise-accounts-section.types';

export function UserProfileEnterpriseAccountRowView({
  account,
  onConnect,
  disabled,
}: {
  account: UserProfileEnterpriseAccount;
  onConnect?: (id: string) => void;
  disabled?: boolean;
}) {
  const m = useMessages('userProfileEnterpriseAccountsSection');
  return (
    <Section.Row xstyle={onConnect && styles.connectRow}>
      <Section.Item>
        <UserProfileProviderMedia
          provider={account.name}
          iconUrl={account.iconUrl}
          monochromeIcon={account.monochromeIcon}
        />
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
            <SubmitButton
              type='button'
              color='neutral'
              size='sm'
              variant='outline'
              aria-label={fill(m.connectProvider, { provider: account.name })}
              isPending={account.isPending}
              pendingLabel={m.connecting}
              disabled={disabled}
              onClick={() => onConnect(account.id)}
            >
              {m.connect}
              <Icon
                glyph={ArrowUpRight}
                placement='inline-end'
                size='sm'
              />
            </SubmitButton>
          </Section.Actions>
        ) : null}
      </Section.Item>
      <Section.Error>{onConnect ? account.connectError : undefined}</Section.Error>
    </Section.Row>
  );
}
