import { Destructive } from '../../../blocks/destructive';
import type { DestructiveController } from '../../../blocks/destructive/destructive.controller';
import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { fill, useMessages } from '../../../localization';

export function UserProfileDangerSectionView(destructiveProps: DestructiveController) {
  const m = useMessages('userProfileDangerSection');

  return (
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Title>{m.sectionTitle}</Section.Title>
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
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}
