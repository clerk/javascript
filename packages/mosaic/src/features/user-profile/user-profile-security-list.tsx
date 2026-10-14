import type { ReactNode, Ref } from 'react';

import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { Section } from '../../components/section';

export function UserProfileSecurityList({
  sectionRef,
  label,
  addLabel,
  emptyLabel,
  hasItems,
  onAdd,
  addControl,
  children,
}: {
  sectionRef?: Ref<HTMLDivElement>;
  label: string;
  addLabel: string;
  emptyLabel: string;
  hasItems: boolean;
  onAdd?: () => void;
  addControl?: ReactNode;
  children: ReactNode;
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
      </Section.Body>
    </Section.Group>
  );
}
