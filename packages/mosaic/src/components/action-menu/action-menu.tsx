import type { Ref } from 'react';

import type { IconName } from '../../icons/registry';
import { Icon } from '../icon';
import { Menu } from '../menu';

type ActionMenuActionAppearance = {
  label: string;
  color?: 'neutral' | 'negative';
  icon?: IconName;
};

export type ActionMenuAction = ActionMenuActionAppearance &
  ({ onClick: () => void; disabled?: boolean } | { onClick?: never; disabled: true });

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
        disabled={disabled || actions.every(action => action.disabled)}
      />
      <Menu.Popup>
        {actions.map(action => (
          <Menu.Item
            key={action.label}
            color={action.color}
            label={action.label}
            onClick={action.onClick}
            disabled={disabled || action.disabled}
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
