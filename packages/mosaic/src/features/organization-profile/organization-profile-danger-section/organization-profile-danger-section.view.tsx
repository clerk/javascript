import type { ConfirmController } from '../../../blocks/confirm';
import { Destructive } from '../../../blocks/destructive';
import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { fill, plural, useLocale, useMessages } from '../../../localization';

export interface OrganizationProfileDangerSectionViewProps {
  name: string;
  memberCount: number;
  leave?: ConfirmController;
  destroy?: ConfirmController;
}

export function OrganizationProfileDangerSectionView({
  name,
  memberCount,
  leave,
  destroy,
}: OrganizationProfileDangerSectionViewProps) {
  const m = useMessages('organizationProfile').danger;
  const locale = useLocale();

  if (!leave && !destroy) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Content>
            <Section.Title>{m.sectionTitle}</Section.Title>
          </Section.Content>
        </Section.Header>
        <Section.Body>
          {leave ? (
            <DangerRow
              controller={leave}
              confirmationValue={name}
              label={m.leave.label}
              description={m.leave.description}
              actionLabel={m.leave.actionLabel}
              dialogTitle={m.leave.dialogTitle}
              dialogDescription={m.leave.dialogDescription}
            />
          ) : null}
          {destroy ? (
            <DangerRow
              controller={destroy}
              confirmationValue={name}
              label={m.delete.label}
              description={m.delete.description}
              actionLabel={m.delete.actionLabel}
              dialogTitle={m.delete.dialogTitle}
              dialogDescription={plural(m.delete.dialogDescription, memberCount, locale, { name })}
            />
          ) : null}
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}

function DangerRow({
  controller,
  confirmationValue,
  label,
  description,
  actionLabel,
  dialogTitle,
  dialogDescription,
}: {
  controller: ConfirmController;
  confirmationValue: string;
  label: string;
  description: string;
  actionLabel: string;
  dialogTitle: string;
  dialogDescription: string;
}) {
  const m = useMessages('organizationProfile').danger;

  return (
    <Section.Row>
      <Section.Item wrap>
        <Section.Content>
          <Section.Label>{label}</Section.Label>
          <Section.Description>{description}</Section.Description>
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
                {actionLabel}
              </Button>
            }
            title={dialogTitle}
            description={dialogDescription}
            fieldLabel={fill(m.fieldLabel, { phrase: confirmationValue })}
            confirmationValue={confirmationValue}
            actionLabel={actionLabel}
            cancelLabel={m.cancelLabel}
          />
        </Section.Actions>
      </Section.Item>
    </Section.Row>
  );
}
