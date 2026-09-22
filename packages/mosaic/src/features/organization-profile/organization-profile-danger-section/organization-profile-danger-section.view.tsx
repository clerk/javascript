import { Destructive } from '../../../blocks/destructive';
import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { fill, plural, useLocale, useMessages } from '../../../localization';
import { useOrganizationProfileDangerActionController } from './organization-profile-danger-action.controller';

export interface OrganizationProfileDangerSectionViewProps {
  name: string;
  memberCount: number;
  onLeave?: () => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function OrganizationProfileDangerSectionView({
  name,
  memberCount,
  onLeave,
  onDelete,
}: OrganizationProfileDangerSectionViewProps) {
  const m = useMessages('organizationProfileDangerSection');
  const locale = useLocale();

  if (!onLeave && !onDelete) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Title>{m.sectionTitle}</Section.Title>
      <Section.Group>
        {onLeave ? (
          <DangerRow
            confirmationValue={name}
            label={m.leave.label}
            description={m.leave.description}
            actionLabel={m.leave.actionLabel}
            dialogTitle={m.leave.dialogTitle}
            dialogDescription={m.leave.dialogDescription}
            onRun={onLeave}
          />
        ) : null}
        {onDelete ? (
          <DangerRow
            confirmationValue={name}
            label={m.delete.label}
            description={m.delete.description}
            actionLabel={m.delete.actionLabel}
            dialogTitle={m.delete.dialogTitle}
            dialogDescription={plural(m.delete.dialogDescription, memberCount, locale, { name })}
            onRun={onDelete}
          />
        ) : null}
      </Section.Group>
    </Section.Root>
  );
}

function DangerRow({
  confirmationValue,
  label,
  description,
  actionLabel,
  dialogTitle,
  dialogDescription,
  onRun,
}: {
  confirmationValue: string;
  label: string;
  description: string;
  actionLabel: string;
  dialogTitle: string;
  dialogDescription: string;
  onRun: () => Promise<void>;
}) {
  const m = useMessages('organizationProfileDangerSection');
  const { isOpen, onOpenChange, onConfirm, isRunning, errorMessage } = useOrganizationProfileDangerActionController({
    onRun,
  });

  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{label}</Section.Label>
          <Section.Description>{description}</Section.Description>
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
                {actionLabel}
              </Button>
            }
            title={dialogTitle}
            description={dialogDescription}
            fieldLabel={fill(m.fieldLabel, { phrase: confirmationValue })}
            confirmationValue={confirmationValue}
            actionLabel={actionLabel}
            cancelLabel={m.cancelLabel}
            onDelete={onConfirm}
            isDeleting={isRunning}
            errorMessage={errorMessage}
          />
        </Section.Actions>
      </Section.Item>
    </Section.Row>
  );
}
