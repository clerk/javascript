import { Destructive } from '../../../blocks/destructive';
import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { fill, useMessages } from '../../../localization';

export interface UserProfileDeleteSectionViewProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  errorMessage: string | undefined;
}

export function UserProfileDeleteSectionView({
  isOpen,
  onOpenChange,
  onConfirm,
  isDeleting,
  errorMessage,
}: UserProfileDeleteSectionViewProps) {
  const m = useMessages('userProfileDeleteSection');

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
