'use client';

import type { ReactElement, ReactNode } from 'react';

import { useInviteMembersController } from '../organization-profile/organization-profile-members-panel/organization-profile-invite-members.controller';
import { useInviteMembersButtonAccessModel, useInviteMembersButtonModel } from './invite-members-button.model';
import type { InviteMembersButtonElementProps } from './invite-members-button.view';
import { InviteMembersButtonView } from './invite-members-button.view';

/** Everything `<InviteMembersButton />` takes: the element it renders, and what stands in while Clerk loads. */
export interface InviteMembersButtonProps extends InviteMembersButtonElementProps {
  /**
   * Fallback while loading.
   *
   * Note that the component renders nothing when there is no active organization or the user cannot
   * manage its members, so using this where either can be true can result in Fallback->Nothing.
   */
  fallback?: ReactNode;
}

/**
 * A headless button that opens the invite-members dialog for the active organization. It ships no
 * styles: it renders a plain `<button>` labelled "Invite members", `children` replaces the label, and
 * `render` swaps the element for your own. Your `onClick` runs alongside opening the dialog. It reads
 * the organization and the user's permissions from Clerk, so it takes no data. It renders `fallback`
 * until Clerk answers, and nothing at all without an active organization or the
 * `org:sys_memberships:manage` permission.
 *
 * @example
 * ```tsx
 * import { InviteMembersButton } from '@clerk/mosaic/features/invite-members-button/invite-members-button';
 *
 * <InviteMembersButton />
 * ```
 *
 * @example
 * `render` takes the element to render, with the button's props merged into it.
 * ```tsx
 * <InviteMembersButton render={<MyButton variant='outline' />}>Add teammates</InviteMembersButton>
 * ```
 */
export function InviteMembersButton({ fallback, ...props }: InviteMembersButtonProps = {}): ReactElement | null {
  const access = useInviteMembersButtonAccessModel();

  if (access.status === 'loading') {
    return <>{fallback}</>;
  }

  if (access.status === 'hidden') {
    return null;
  }

  return (
    <ConnectedInviteMembersButton
      key={`${access.organizationId}:${access.sessionId}`}
      {...props}
    />
  );
}

function ConnectedInviteMembersButton(props: InviteMembersButtonElementProps): ReactElement | null {
  const model = useInviteMembersButtonModel();
  const { onInvite, ...controller } = useInviteMembersController(model);

  if (!onInvite) {
    return null;
  }

  return (
    <InviteMembersButtonView
      {...props}
      {...controller}
      onInvite={onInvite}
    />
  );
}
