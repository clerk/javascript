import type { ReactNode } from 'react';

import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { Section } from '../components/section';
import { userProfileSecurityBase as m } from './user-profile-security.messages';

export function UserProfileSecurityList({
  sectionTitle,
  label,
  addLabel,
  emptyLabel,
  hasItems,
  onAdd,
  addControl,
  notice,
  children,
}: {
  sectionTitle?: string;
  label: string;
  addLabel: string;
  emptyLabel: string;
  hasItems: boolean;
  onAdd?: () => void;
  addControl?: ReactNode;
  notice?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Section.Root aria-label={sectionTitle ? undefined : label}>
      {sectionTitle ? <Section.Title>{sectionTitle}</Section.Title> : null}
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>{label}</Section.Label>
            </Section.Content>
            {addControl ? (
              <Section.Actions>{addControl}</Section.Actions>
            ) : onAdd ? (
              <Section.Actions>
                <Button
                  aria-label={addLabel}
                  color='neutral'
                  size='sm'
                  variant='outline'
                  onClick={onAdd}
                >
                  <Icon
                    name='plus'
                    placement='inline-start'
                    size='sm'
                  />
                  {m.sections.add}
                </Button>
              </Section.Actions>
            ) : null}
          </Section.Item>
          {notice ? (
            <Section.Item>
              <Section.Content>{notice}</Section.Content>
            </Section.Item>
          ) : null}
          <Section.Items>
            {hasItems ? (
              children
            ) : (
              <Section.Item>
                <Section.Content>
                  <Section.Description>{emptyLabel}</Section.Description>
                </Section.Content>
              </Section.Item>
            )}
          </Section.Items>
        </Section.Row>
      </Section.Group>
    </Section.Root>
  );
}
