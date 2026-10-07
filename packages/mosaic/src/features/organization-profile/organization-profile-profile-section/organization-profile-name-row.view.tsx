import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import { OrganizationProfileEditFieldDialog } from './organization-profile-edit-field.dialog';
import { useOrganizationProfileEditNameController } from './organization-profile-edit-name.controller';

export interface OrganizationProfileNameRowViewProps {
  name: string;
  onSubmit?: (name: string) => Promise<void>;
}

export function OrganizationProfileNameRowView({ name, onSubmit }: OrganizationProfileNameRowViewProps) {
  const m = useMessages('organizationProfileProfileSection');
  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{m.name.label}</Section.Label>
          <Section.Description>{name}</Section.Description>
        </Section.Content>
        {onSubmit ? (
          <Section.Actions>
            <EditName
              name={name}
              onSubmit={onSubmit}
            />
          </Section.Actions>
        ) : null}
      </Section.Item>
    </Section.Row>
  );
}

function EditName({ name, onSubmit }: { name: string; onSubmit: (name: string) => Promise<void> }) {
  const m = useMessages('organizationProfileProfileSection');
  const controller = useOrganizationProfileEditNameController(name, onSubmit);
  const { ref, ...field } = controller.form.register('name');

  return (
    <OrganizationProfileEditFieldDialog
      open={controller.isOpen}
      onOpenChange={controller.onOpenChange}
      formId={controller.form.id}
      onSubmit={controller.form.handleSubmit}
      fieldRef={ref}
      {...field}
      feedback={controller.form.fields.name.feedback}
      error={controller.form.error}
      canSave={controller.form.canSubmit}
      isSaving={controller.form.isSubmitting}
      title={m.name.dialogTitle}
      fieldLabel={m.name.fieldLabel}
      cancelLabel={m.name.cancel}
      saveLabel={m.name.save}
      trigger={
        <Button
          color='neutral'
          size='sm'
          variant='outline'
        >
          {m.name.edit}
        </Button>
      }
    />
  );
}
