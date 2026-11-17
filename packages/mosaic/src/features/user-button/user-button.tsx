'use client';

import type { ReactElement } from 'react';

import type { UserButtonProps } from '../switcher/switcher';
import { Switcher } from '../switcher/switcher';

/**
 * The signed-in user's avatar, and the account menu behind it: switch or add an account, open the
 * profile, and sign out. It never lists an organization, even when one is active. It is
 * `<Switcher mode='user' />`; use `<Switcher />` for accounts and organizations in one menu.
 *
 * @example
 * ```tsx
 * import { UserButton } from '@clerk/mosaic';
 *
 * <UserButton afterSwitchSessionUrl='/dashboard' />
 * ```
 */
export function UserButton(props: UserButtonProps = {}): ReactElement {
  return (
    <Switcher
      {...props}
      mode='user'
    />
  );
}
