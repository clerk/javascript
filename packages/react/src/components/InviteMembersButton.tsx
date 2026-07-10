import type { InviteMembersButtonProps } from '@clerk/shared/types';
import React from 'react';

import type { WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

/**
 * A button component that opens a modal containing the organization invite-members form when
 * clicked. Wrap your own button, or omit children to render a default one.
 *
 * Requires an active organization, and should be rendered for members who can manage memberships
 * (the `org:sys_memberships:manage` permission). Guard with `<Protect>` or `useAuth()` if unsure.
 *
 * @example
 * ```tsx
 * import { InviteMembersButton } from '@clerk/react';
 *
 * function InviteButton() {
 *   return (
 *     <InviteMembersButton>
 *       <button>Invite members</button>
 *     </InviteMembersButton>
 *   );
 * }
 * ```
 */
export const InviteMembersButton = withClerk(
  ({ clerk, children, ...props }: WithClerkProp<React.PropsWithChildren<InviteMembersButtonProps>>) => {
    const { appearance, getContainer, component, ...rest } = props;

    children = normalizeWithDefaultValue(children, 'Invite members');
    const child = assertSingleChild(children)('InviteMembersButton');

    const clickHandler = () => {
      return clerk.openInviteMembers({ appearance, getContainer });
    };

    const wrappedChildClickHandler: React.MouseEventHandler = async e => {
      if (child && typeof child === 'object' && 'props' in child) {
        await safeExecute(child.props.onClick)(e);
      }
      return clickHandler();
    };

    const childProps = { ...rest, onClick: wrappedChildClickHandler };
    return React.cloneElement(child as React.ReactElement<unknown>, childProps);
  },
  { component: 'InviteMembersButton', renderWhileLoading: true },
);
