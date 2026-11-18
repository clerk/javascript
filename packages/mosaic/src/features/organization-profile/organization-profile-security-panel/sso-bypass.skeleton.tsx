import { inertProps } from '@clerk/shared/inert';
import * as stylex from '@stylexjs/stylex';

import { ActionMenu } from '../../../components/action-menu';
import { Avatar } from '../../../components/avatar';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Entity } from '../../../components/entity';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { Skeleton } from '../../../components/skeleton';
import { Table } from '../../../components/table';
import { Text } from '../../../components/text';
import { VisuallyHidden } from '../../../components/visually-hidden';
import { Plus } from '../../../icons/glyphs/plus';
import { useMessages } from '../../../localization';
import { mergeStyleProps, themeProps } from '../../../props';
import { styles } from './organization-profile-security-panel.styles';

const PLACEHOLDER_ENTRIES = [
  { userId: 'user_placeholder_1', name: 'Jordan Reyes', identifier: 'jordan.reyes@northwind.co' },
  { userId: 'user_placeholder_2', name: 'Priya Natarajan', identifier: 'priya@northwind.co' },
];

export function SSOBypassSectionSkeleton() {
  const m = useMessages('organizationProfile').security.ssoBypass;
  return (
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Content>
            <Section.Title>{m.title}</Section.Title>
          </Section.Content>
        </Section.Header>
        <Section.Body>
          <Section.Row aria-hidden>
            <Section.Item>
              <Section.Content>
                <Section.Label>
                  <span {...stylex.props(styles.count)}>
                    {m.allowlistLabel}
                    <Skeleton shape='pill'>
                      <Badge color='neutral'>12 members</Badge>
                    </Skeleton>
                  </span>
                </Section.Label>
                <Section.Description>{m.description}</Section.Description>
              </Section.Content>
              <Section.Actions>
                <Skeleton visible={false}>
                  <ActionMenu
                    label={m.manageLabel}
                    disabled
                    actions={[{ label: m.manage, onClick: () => undefined }]}
                  />
                </Skeleton>
              </Section.Actions>
            </Section.Item>
          </Section.Row>
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}

export function SSOBypassPageSkeleton() {
  const m = useMessages('organizationProfile').security.ssoBypassPage;
  return (
    <div {...mergeStyleProps(themeProps('organization-profile-sso-bypass'), stylex.props(styles.page))}>
      <VisuallyHidden role='status'>{m.loading}</VisuallyHidden>
      <Text color='foreground-secondary'>{m.description}</Text>
      <Table.Toolbar>
        <Table.Search
          label={m.search}
          clearLabel={m.clearSearch}
          value=''
          onValueChange={() => undefined}
          disabled
        />
        <Button disabled>
          <Icon glyph={Plus} />
          {m.add}
        </Button>
      </Table.Toolbar>
      <Table.Root
        layout='fixed'
        aria-label={m.tableLabel}
        aria-busy
      >
        <Table.Header>
          <Table.Column>{m.user}</Table.Column>
          <Table.Column
            align='end'
            width='4rem'
          >
            <VisuallyHidden>{m.actions}</VisuallyHidden>
          </Table.Column>
        </Table.Header>
        <Table.Body
          aria-hidden
          {...inertProps(true)}
          items={PLACEHOLDER_ENTRIES}
          itemToStringValue={entry => entry.userId}
        >
          {entry => (
            <Table.Row disabled>
              <Table.Cell>
                <Entity.Root>
                  <Skeleton shape='pill'>
                    <Entity.Media>
                      <Avatar.Root
                        size='fit'
                        aria-hidden
                      >
                        <Avatar.Fallback />
                      </Avatar.Root>
                    </Entity.Media>
                  </Skeleton>
                  <Entity.Content>
                    <Entity.Label>
                      <Skeleton>{entry.name}</Skeleton>
                    </Entity.Label>
                    <Entity.Description>
                      <Skeleton>{entry.identifier}</Skeleton>
                    </Entity.Description>
                  </Entity.Content>
                </Entity.Root>
              </Table.Cell>
              <Table.Cell align='end'>
                <Skeleton visible={false}>
                  <ActionMenu
                    label={entry.name}
                    disabled
                    actions={[{ label: m.remove, color: 'negative', onClick: () => undefined }]}
                  />
                </Skeleton>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </div>
  );
}
