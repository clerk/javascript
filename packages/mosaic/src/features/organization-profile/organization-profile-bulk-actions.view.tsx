import type { ReactElement } from 'react';
import { createPortal } from 'react-dom';

import { ActionBar } from '../../components/action-bar';
import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { Menu } from '../../components/menu';
import { styles } from './organization-profile-members-panel.styles';
import type { OrganizationRole } from './organization-profile-members-panel.types';

/**
 * Where the bulk bar renders and how it is pinned. `frame` anchors it to a bounded surface (the
 * dialog's non-scrolling frame). `viewport` pins it to the window, centered, the way a modal floats
 * — used by the embedded profile, which has no bounded frame of its own. `null` renders it inline.
 */
export interface OrganizationProfileBulkOverlay {
  container: HTMLElement;
  mode: 'frame' | 'viewport';
}

export interface OrganizationProfileBulkActionsProps {
  /** How many rows are selected. The bar renders nothing when zero. */
  count: number;
  roles: OrganizationRole[];
  /** Where and how the floating bar is pinned; falls back to inline when absent. */
  overlay: OrganizationProfileBulkOverlay | null;
  /** Change the role of the selection. Omitted hides the control. */
  onChangeRole?: (role: string) => void;
  /** Remove the selection. Omitted hides the control. */
  onRemove?: () => void;
  /** The remove control's accessible label, e.g. "Remove selected members". */
  removeLabel: string;
  onDismiss: () => void;
  'aria-label': string;
}

/**
 * The floating bulk-action bar shared by the members, invitations, and requests tabs: a count, a
 * "Change role" menu, a remove control, and a dismiss. It pins to the surface's non-scrolling frame
 * so it clears the scroll region's bottom fade.
 */
export function OrganizationProfileBulkActions({
  count,
  roles,
  overlay,
  onChangeRole,
  onRemove,
  removeLabel,
  onDismiss,
  'aria-label': ariaLabel,
}: OrganizationProfileBulkActionsProps): ReactElement {
  const positionerXstyle = overlay
    ? overlay.mode === 'viewport'
      ? styles.bulkActionBarViewportPositioner
      : styles.bulkActionBarOverlayPositioner
    : undefined;
  const bar = (
    <ActionBar.Root
      open={count > 0}
      aria-label={ariaLabel}
      positionerXstyle={positionerXstyle}
    >
      <ActionBar.Count>{count} selected</ActionBar.Count>
      <ActionBar.Separator />
      {onChangeRole ? (
        <Menu.Root placement='top'>
          <Menu.Trigger
            render={
              <Button
                variant='ghost'
                size='md'
              />
            }
          >
            Change role
            <Icon
              name='chevron-down'
              placement='inline-end'
            />
          </Menu.Trigger>
          <Menu.Popup xstyle={styles.roleMenuPopup}>
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
      ) : null}
      {onChangeRole && onRemove ? <ActionBar.Separator /> : null}
      {onRemove ? (
        <Button
          color='negative'
          variant='ghost'
          shape='square'
          size='md'
          aria-label={removeLabel}
          onClick={onRemove}
        >
          <Icon name='trash' />
        </Button>
      ) : null}
      <ActionBar.Separator />
      <ActionBar.Dismiss onClick={onDismiss} />
    </ActionBar.Root>
  );
  return overlay ? createPortal(bar, overlay.container) : bar;
}
