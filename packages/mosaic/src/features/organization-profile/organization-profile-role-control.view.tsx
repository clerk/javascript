import type { ReactElement } from 'react';

import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { Menu } from '../../components/menu';
import type { OrganizationRole } from './organization-profile-members-panel.types';

export interface OrganizationProfileRoleControlProps {
  value: string;
  roles: OrganizationRole[];
  onChangeRole?: (role: string) => void;
}

export function OrganizationProfileRoleControl({
  value,
  roles,
  onChangeRole,
}: OrganizationProfileRoleControlProps): ReactElement {
  const label = roles.find(role => role.value === value)?.label ?? value;
  if (!onChangeRole) {
    return (
      <Button
        variant='ghost'
        size='md'
        disabled
      >
        {label}
      </Button>
    );
  }
  return (
    <Menu.Root placement='bottom-start'>
      <Menu.Trigger
        render={
          <Button
            variant='ghost'
            size='md'
          />
        }
      >
        {label}
        <Icon
          name='chevron-down'
          placement='inline-end'
        />
      </Menu.Trigger>
      <Menu.Popup>
        {roles.map(role => (
          <Menu.Item
            key={role.value}
            label={role.label}
            onClick={() => onChangeRole(role.value)}
          >
            <Menu.Label>{role.label}</Menu.Label>
          </Menu.Item>
        ))}
      </Menu.Popup>
    </Menu.Root>
  );
}
