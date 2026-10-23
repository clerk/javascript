import { type Ref, useState } from 'react';

import { useSpinDelay } from '../../hooks/use-spin-delay';
import type { IconName } from '../../icons/registry';
import { Icon } from '../icon';
import { Menu } from '../menu';
import { Spinner } from '../spinner';

type ActionMenuActionAppearance = {
  label: string;
  color?: 'neutral' | 'negative';
  icon?: IconName;
};

export type ActionMenuAction = ActionMenuActionAppearance &
  (
    | { onClick: () => void; disabled?: boolean; progress?: 'idle' | 'pending' | 'handoff' }
    | { onClick?: never; disabled: true; progress?: never }
  );

export interface ActionMenuProps {
  label: string;
  actions: ActionMenuAction[];
  triggerRef?: Ref<HTMLButtonElement>;
  disabled?: boolean;
}

export function ActionMenu({ label, actions, triggerRef, disabled }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [activated, setActivated] = useState(false);
  const pending = actions.some(action => action.progress === 'pending');
  const handoff = actions.some(action => action.progress === 'handoff');
  const showSpinner = useSpinDelay(pending ? true : null);

  if (activated && !pending) {
    setActivated(false);
    setOpen(false);
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <Menu.Root
      placement='bottom-end'
      open={open && !handoff}
      onOpenChange={nextOpen => {
        if (!pending && !handoff) {
          setOpen(nextOpen);
        }
      }}
    >
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
            onClick={() => {
              if (action.progress !== undefined) {
                setActivated(true);
              }
              action.onClick?.();
            }}
            closeOnClick={action.progress === undefined}
            aria-busy={action.progress === 'pending' || undefined}
            disabled={disabled || action.disabled || pending || handoff}
          >
            {action.icon ? (
              <Menu.Media>
                <Icon name={action.icon} />
              </Menu.Media>
            ) : null}
            <Menu.Label>{action.label}</Menu.Label>
            {action.progress === 'pending' && showSpinner ? (
              <Spinner
                size='sm'
                role='progressbar'
                aria-hidden={undefined}
                aria-label={action.label}
              />
            ) : null}
          </Menu.Item>
        ))}
      </Menu.Popup>
    </Menu.Root>
  );
}
