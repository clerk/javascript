import { inertProps } from '@clerk/shared/inert';

import { ActionMenu } from '../../../components/action-menu';
import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { Skeleton } from '../../../components/skeleton';
import { VisuallyHidden } from '../../../components/visually-hidden';
import { Plus } from '../../../icons/glyphs/plus';
import { useMessages } from '../../../localization';
import { themeProps } from '../../../props';

const PLACEHOLDER_ENTRIES = [
  { userId: 'user_placeholder_1', name: 'Jordan Reyes', identifier: 'jordan.reyes@northwind.co' },
  { userId: 'user_placeholder_2', name: 'Priya Natarajan', identifier: 'priya@northwind.co' },
  { userId: 'user_placeholder_3', name: 'Sam Whitfield', identifier: 'sam.whitfield@northwind.co' },
];

export function SSOBypassSectionSkeleton() {
  const m = useMessages('organizationProfile').security.ssoBypass;
  return (
    <Section.Root {...themeProps('organization-profile-sso-bypass')}>
      <Section.Group aria-busy>
        <VisuallyHidden role='status'>{m.loading}</VisuallyHidden>
        <Section.Header>
          <Section.Content>
            <Section.Title>{m.title}</Section.Title>
            <Section.Description>{m.description}</Section.Description>
          </Section.Content>
          <Section.Actions>
            <Button
              color='neutral'
              size='sm'
              variant='outline'
              disabled
            >
              <Icon
                glyph={Plus}
                placement='inline-start'
                size='md'
              />
              {m.add}
            </Button>
          </Section.Actions>
        </Section.Header>
        <Section.Body>
          <Section.Items
            aria-hidden
            {...inertProps(true)}
          >
            {PLACEHOLDER_ENTRIES.map(entry => (
              <Section.Item key={entry.userId}>
                <Section.Content>
                  <Section.Label>
                    <Skeleton>{entry.name}</Skeleton>
                  </Section.Label>
                  <Section.Description>
                    <Skeleton>{entry.identifier}</Skeleton>
                  </Section.Description>
                </Section.Content>
                <Section.Actions>
                  <Skeleton visible={false}>
                    <ActionMenu
                      label={entry.name}
                      disabled
                      actions={[{ label: m.remove, color: 'negative', onClick: () => undefined }]}
                    />
                  </Skeleton>
                </Section.Actions>
              </Section.Item>
            ))}
          </Section.Items>
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}
