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
  /** Names the trigger, which carries no label of its own. */
  label: string;
  /** Rendered in order. An empty list renders nothing, so a row with no actions shows no trigger. */
  actions: ActionMenuAction[];
  /** The trigger element, for a caller that has to hand focus back to this row. */
  triggerRef?: Ref<HTMLButtonElement>;
}

/**
 * The overflow menu a row hangs its secondary actions from: an icon trigger over a `Menu` of
 * labelled, optionally iconed items.
 */
export function ActionMenu({ label, actions, triggerRef }: ActionMenuProps) {
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
