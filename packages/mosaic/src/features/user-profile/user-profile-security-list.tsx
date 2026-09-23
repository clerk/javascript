import type { ReactNode } from 'react';

import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { Section } from '../../components/section';

export function UserProfileSecurityList({
  sectionTitle,
  asGroup = false,
  label,
  addLabel,
  emptyLabel,
  hasItems,
  onAdd,
  addControl,
  children,
}: {
  sectionTitle?: string;
  asGroup?: boolean;
  label: string;
  addLabel: string;
  emptyLabel: string;
  hasItems: boolean;
  onAdd?: () => void;
  addControl?: ReactNode;
  children: ReactNode;
}) {
  const group = (
    <Section.Group
      variant={asGroup ? 'contained' : 'default'}
      aria-label={asGroup ? label : undefined}
    >
      {sectionTitle ? <Section.Title>{sectionTitle}</Section.Title> : null}
      <Section.Surface>
        <Section.Row>
          <Section.Header>
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
          </Section.Header>
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
      </Section.Surface>
    </Section.Group>
  );

  return asGroup ? group : <Section.Root aria-label={sectionTitle ? undefined : label}>{group}</Section.Root>;
}
