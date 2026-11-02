import type { ConfirmController } from '../../../blocks/confirm';
import { Destructive } from '../../../blocks/destructive';
import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { fill, useMessages } from '../../../localization';

export interface UserProfileDangerSectionViewProps {
  controller: ConfirmController;
}

export function UserProfileDangerSectionView({ controller }: UserProfileDangerSectionViewProps) {
  const m = useMessages('userProfile').danger;

  return (
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Content>
            <Section.Title>{m.sectionTitle}</Section.Title>
          </Section.Content>
        </Section.Header>
        <Section.Body>
          <Section.Row>
            <Section.Item wrap>
              <Section.Content>
                <Section.Label>{m.sectionLabel}</Section.Label>
                <Section.Description>{m.sectionDescription}</Section.Description>
              </Section.Content>
              <Section.Actions>
                <Destructive
                  controller={controller}
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
                />
              </Section.Actions>
            </Section.Item>
          </Section.Row>
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}
