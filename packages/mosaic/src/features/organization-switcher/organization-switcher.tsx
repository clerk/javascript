'use client';

import type { ReactElement } from 'react';

import type { SwitcherProps } from '../switcher/switcher';
import { Switcher } from '../switcher/switcher';
import type { OrganizationSwitcherModelOptions } from '../switcher/switcher.model';
import type { SwitcherMenuProps } from '../switcher/switcher.types';
import type { SwitcherTriggerProps } from '../switcher/switcher.view';

/** Everything `<OrganizationSwitcher />` takes: trigger content, and the app's own menu rows. */
export type OrganizationSwitcherProps = OrganizationSwitcherModelOptions &
  SwitcherTriggerProps &
  SwitcherMenuProps &
  Pick<SwitcherProps, 'fallback'>;

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
 * `createOrganizationUrl` routes to a page of your own instead of opening Clerk's modal. `afterSelectOrganizationUrl`
 * is where switching organization lands, and takes a `:param` template, a plain path, or a function. Set
 * `organizationProfileUrl` on `MosaicProvider`'s `profile` to route Settings to a page of your own.
 * ```tsx
 * <OrganizationSwitcher
 *   createOrganizationUrl='/orgs/new'
 *   afterSelectOrganizationUrl='/orgs/:slug'
 *   afterSelectPersonalUrl='/dashboard'
 * />
 * ```
 *
 * @example
 * `customMenuItems` adds your own rows beside Settings, each one either an `onClick` action or an
 * `href` link. The profile's own pages are set on `MosaicProvider`'s `profile`.
 * ```tsx
 * <OrganizationSwitcher
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
