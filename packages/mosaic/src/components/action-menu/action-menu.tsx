import type { Ref } from 'react';

import type { IconName } from '../../icons/registry';
import { Icon } from '../icon';
import { Menu } from '../menu';

export interface ActionMenuAction {
  label: string;
  color?: 'neutral' | 'negative';
  icon?: IconName;
  onClick: () => void;
}

export interface ActionMenuProps {
  label: string;
  actions: ActionMenuAction[];
  triggerRef?: Ref<HTMLButtonElement>;
  disabled?: boolean;
}

export function ActionMenu({ label, actions, triggerRef, disabled }: ActionMenuProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <Menu.Root placement='bottom-end'>
      <Menu.Trigger
        ref={triggerRef}
        aria-label={label}
        disabled={disabled}
      />
      <Menu.Popup>
        {actions.map(action => (
          <Menu.Item
            key={action.label}
            color={action.color}
            label={action.label}
            onClick={action.onClick}
            disabled={disabled}
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
