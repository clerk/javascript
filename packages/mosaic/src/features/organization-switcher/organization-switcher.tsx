'use client';

import type { ReactElement } from 'react';

import type { SwitcherProps } from '../switcher/switcher';
import { Switcher } from '../switcher/switcher';
import type { OrganizationSwitcherModelOptions } from '../switcher/switcher.model';
import type { SwitcherMenuProps } from '../switcher/switcher.types';
import type { SwitcherTriggerProps } from '../switcher/switcher.view';

/** Everything `<OrganizationSwitcher />` takes: profile routing, trigger content, the app's own menu rows, and the profile it opens. */
export type OrganizationSwitcherProps = OrganizationSwitcherModelOptions &
  SwitcherTriggerProps &
  SwitcherMenuProps &
  Pick<SwitcherProps, 'organizationProfileProps' | 'fallback'>;

/**
 * The active organization's avatar, and the menu behind it: switch organization or back to the
 * personal account, join a suggested or invited one, create one, invite members, and open the
 * organization's settings. It reads the active session and organization from Clerk, so it takes no
 * data. It renders `fallback` until Clerk answers, and nothing at all when nobody is signed in or the
 * instance has organizations turned off.
 *
 * @example
 * ```tsx
 * import { OrganizationSwitcher } from '@clerk/mosaic';
 *
 * <OrganizationSwitcher />
 * ```
 *
 * @example
 * `hidePersonal` leaves the personal account out of the list, so only organizations can be picked.
 * ```tsx
 * <OrganizationSwitcher hidePersonal />
 * ```
 *
 * @example
 * Passing a URL routes to a page of your own instead of opening Clerk's modal. `afterSelectOrganizationUrl`
 * is where switching organization lands, and takes a `:param` template, a plain path, or a function.
 * ```tsx
 * <OrganizationSwitcher
 *   organizationProfileUrl='/settings/organization'
 *   createOrganizationUrl='/orgs/new'
 *   afterSelectOrganizationUrl='/orgs/:slug'
 *   afterSelectPersonalUrl='/dashboard'
 * />
 * ```
 *
 * @example
 * `customPages` adds your own pages to the organization profile; `customMenuItems` adds your own rows
 * to the foot of the menu, each one either an `onClick` action or an `href` link.
 * ```tsx
 * <OrganizationSwitcher
 *   organizationProfileProps={{
 *     customPages: [{ path: 'audit', label: 'Audit log', icon: <ListIcon />, content: <AuditPage /> }],
 *     pageOrder: ['general', 'members', 'audit'],
 *   }}
 *   customMenuItems={[{ id: 'docs', label: 'Documentation', icon: <BookIcon />, href: 'https://example.com/docs' }]}
 * />
 * ```
 */
export function OrganizationSwitcher(props: OrganizationSwitcherProps = {}): ReactElement {
  return (
    <Switcher
      {...props}
      mode='organization'
    />
  );
}
