import { Menu } from '../components/menu';

export interface UserProfileMenuAction {
  label: string;
  color?: 'neutral' | 'negative';
  onClick: () => void;
}

export function UserProfileActionMenu({ label, actions }: { label: string; actions: UserProfileMenuAction[] }) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <Menu.Root placement='bottom-end'>
      <Menu.Trigger aria-label={label} />
      <Menu.Content>
        {actions.map(action => (
          <Menu.Item
            key={action.label}
            color={action.color}
            label={action.label}
            onClick={action.onClick}
          />
        ))}
      </Menu.Content>
    </Menu.Root>
  );
}
