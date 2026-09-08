import { Destructive } from '../../blocks/destructive';
import { Button } from '../../components/button';
import { Section } from '../../components/section';
import { useUserProfileDeleteSectionController } from './user-profile-delete-section.controller';
import { fill, userProfileDeleteSectionBase as m } from './user-profile-delete-section.messages';

export interface UserProfileDeleteSectionViewProps {
  /**
   * Deletes the account. Resolve and the confirmation dialog closes; reject with an `Error`
   * and it stays open with that message under the confirmation field.
   */
  onDelete: () => Promise<void>;
}

export function UserProfileDeleteSectionView({ onDelete }: UserProfileDeleteSectionViewProps) {
  const { isOpen, onOpenChange, onConfirm, isDeleting, errorMessage } = useUserProfileDeleteSectionController({
    onDelete,
  });

  return (
    <Section.Root>
      <Section.Title>{m.sectionTitle}</Section.Title>
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>{m.sectionLabel}</Section.Label>
              <Section.Description>{m.sectionDescription}</Section.Description>
            </Section.Content>
            <Section.Actions>
              <Destructive
                open={isOpen}
                onOpenChange={onOpenChange}
                trigger={
                  <Button
                    color='negative'
                    size='sm'
                    variant='outline'
                  >
                    {m.actionLabel}
                  </Button>
                }
                title={m.dialogTitle}
                description={m.dialogDescription}
                fieldLabel={fill(m.fieldLabel, { phrase: m.fieldPlaceholder })}
                confirmationValue={m.fieldPlaceholder}
                actionLabel={m.actionLabel}
                cancelLabel={m.cancelLabel}
                onDelete={onConfirm}
                isDeleting={isDeleting}
                errorMessage={errorMessage}
              />
            </Section.Actions>
          </Section.Item>
        </Section.Row>
      </Section.Group>
    </Section.Root>
  );
}
