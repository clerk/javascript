import type { ReactNode } from 'react';

import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { Section } from '../components/section';

export function UserProfileSecurityList({
  sectionTitle,
  label,
  addLabel,
  emptyLabel,
  hasItems,
  onAdd,
  addControl,
  children,
}: {
  sectionTitle?: string;
  label: string;
  addLabel: string;
  emptyLabel: string;
  hasItems: boolean;
  onAdd?: () => void;
  addControl?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Section.Root aria-label={sectionTitle ? undefined : label}>
      {sectionTitle ? <Section.Title>{sectionTitle}</Section.Title> : null}
      <Section.Group>
        <Section.Row variant='list'>
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
                  Add
                </Button>
              </Section.Actions>
            ) : null}
          </Section.Item>
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
