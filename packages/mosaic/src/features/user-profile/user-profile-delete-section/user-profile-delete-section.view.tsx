import { Destructive } from '../../../blocks/destructive';
import type { DestructiveController } from '../../../blocks/destructive/destructive.controller';
import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { fill, useMessages } from '../../../localization';

export function UserProfileDeleteSectionView(destructiveProps: DestructiveController) {
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
                {...destructiveProps}
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
      </Section.Group>
    </Section.Root>
  );
}
