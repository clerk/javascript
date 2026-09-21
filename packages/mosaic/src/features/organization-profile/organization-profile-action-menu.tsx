import type { Ref } from 'react';

import { Icon } from '../../components/icon';
import { Menu } from '../../components/menu';
import type { IconName } from '../../icons/registry';

export interface OrganizationProfileMenuAction {
  label: string;
  color?: 'neutral' | 'negative';
  icon?: IconName;
  onClick: () => void;
}

export function OrganizationProfileActionMenu({
  label,
  actions,
  triggerRef,
}: {
  label: string;
  actions: OrganizationProfileMenuAction[];
  triggerRef?: Ref<HTMLButtonElement>;
}) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <Menu.Root placement='bottom-end'>
      <Menu.Trigger
        ref={triggerRef}
        aria-label={label}
      />
      <Menu.Popup>
        {actions.map(action => (
          <Menu.Item
            key={action.label}
            color={action.color}
            label={action.label}
            onClick={action.onClick}
          >
            {action.icon ? (
              <Menu.Media>
                <Icon name={action.icon} />
              </Menu.Media>
            ) : null}
            <Menu.Label>{action.label}</Menu.Label>
          </Menu.Item>
        ))}
      </Menu.Popup>
    </Menu.Root>
  );
}
