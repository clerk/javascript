import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import { useOrganizationProfileEditFieldController } from './organization-profile-edit-field.controller';
import { OrganizationProfileEditFieldDialog } from './organization-profile-edit-field.dialog';

export interface OrganizationProfileNameRowViewProps {
  name: string;
  onSubmit?: (name: string) => Promise<void>;
}

export function OrganizationProfileNameRowView({ name, onSubmit }: OrganizationProfileNameRowViewProps) {
  const m = useMessages('organizationProfileWorkspaceSection');
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
  const m = useMessages('organizationProfileWorkspaceSection');
  const controller = useOrganizationProfileEditFieldController({ value: name, onSubmit });

  return (
    <OrganizationProfileEditFieldDialog
      {...controller}
      open={controller.isOpen}
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
