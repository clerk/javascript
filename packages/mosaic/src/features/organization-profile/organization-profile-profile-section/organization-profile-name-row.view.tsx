import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import { useOrganizationProfileEditNameController } from './organization-profile-edit-name.controller';
import { OrganizationProfileEditNameDialog } from './organization-profile-edit-name.dialog';

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
  const controller = useOrganizationProfileEditNameController({ name, onSubmit });

  return (
    <OrganizationProfileEditNameDialog
      form={controller.form}
      open={controller.isOpen}
      onOpenChange={controller.onOpenChange}
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
