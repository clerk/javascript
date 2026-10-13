import type { ReactNode, Ref } from 'react';

import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { Section } from '../../components/section';

export function UserProfileSecurityList<T>({
  sectionRef,
  label,
  addLabel,
  emptyLabel,
  items,
  getKey,
  onAdd,
  addControl,
  children,
}: {
  sectionRef?: Ref<HTMLDivElement>;
  label: string;
  addLabel: string;
  emptyLabel: string;
  items: T[];
  getKey: (item: T) => string;
  onAdd?: () => void;
  addControl?: ReactNode;
  children: (item: T, row: { present: boolean }) => ReactNode;
}) {
  return (
    <Section.Group
      ref={sectionRef}
      tabIndex={-1}
    >
      <Section.Header>
        <Section.Content>
          <Section.Title>{label}</Section.Title>
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
      <Section.Body>
        <Section.AnimatedItems
          items={items}
          getKey={getKey}
          empty={
            <Section.Content>
              <Section.Description>{emptyLabel}</Section.Description>
            </Section.Content>
          }
        >
          {children}
        </Section.AnimatedItems>
      </Section.Body>
    </Section.Group>
  );
}
