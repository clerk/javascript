import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import type { UserProfileNameAttribute } from './user-profile-account-section.types';
import { useUserProfileEditNameController } from './user-profile-edit-name.controller';
import type { UserProfileEditNameValue } from './user-profile-edit-name.dialog';
import { UserProfileEditNameDialog } from './user-profile-edit-name.dialog';

export interface UserProfileNameRowViewProps {
  name: string;
  firstName?: string;
  lastName?: string;
  firstNameAttribute?: UserProfileNameAttribute;
  lastNameAttribute?: UserProfileNameAttribute;
  onSubmit?: (value: UserProfileEditNameValue) => Promise<void>;
}

export function UserProfileNameRowView({
  name,
  firstName,
  lastName,
  firstNameAttribute,
  lastNameAttribute,
  onSubmit,
}: UserProfileNameRowViewProps) {
  const m = useMessages('userProfileAccountSection');
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
              firstName={firstName}
              lastName={lastName}
              firstNameAttribute={firstNameAttribute}
              lastNameAttribute={lastNameAttribute}
              onSubmit={onSubmit}
            />
          </Section.Actions>
        ) : null}
      </Section.Item>
    </Section.Row>
  );
}

function EditName({
  firstName,
  lastName,
  firstNameAttribute,
  lastNameAttribute,
  onSubmit,
}: {
  firstName?: string;
  lastName?: string;
  firstNameAttribute?: UserProfileNameAttribute;
  lastNameAttribute?: UserProfileNameAttribute;
  onSubmit: (value: UserProfileEditNameValue) => Promise<void>;
}) {
  const m = useMessages('userProfileAccountSection');
  const controller = useUserProfileEditNameController({ firstName, lastName, onSubmit });

  return (
    <UserProfileEditNameDialog
      {...controller}
      firstNameAttribute={firstNameAttribute}
      lastNameAttribute={lastNameAttribute}
      open={controller.isOpen}
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
