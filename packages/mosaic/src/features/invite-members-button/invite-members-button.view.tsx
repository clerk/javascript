import type { MouseEventHandler, ReactElement } from 'react';

import { useMessages } from '../../localization';
import type { ButtonProps } from '../../primitives/button';
import { Button } from '../../primitives/button';
import { mergeProps } from '../../primitives/utils';
import type { OrganizationProfileInviteMembersDialogProps } from '../organization-profile/organization-profile-members-panel/organization-profile-invite-members.dialog';
import { OrganizationProfileInviteMembersDialog } from '../organization-profile/organization-profile-members-panel/organization-profile-invite-members.dialog';

export type InviteMembersButtonElementProps = Omit<ButtonProps, 'ref'>;

export interface InviteMembersButtonViewProps extends InviteMembersButtonElementProps {
  onInvite: MouseEventHandler<HTMLButtonElement>;
  isInviteDisabled?: boolean;
  inviteDialog?: OrganizationProfileInviteMembersDialogProps;
}

export function InviteMembersButtonView({
  onInvite,
  isInviteDisabled = false,
  inviteDialog,
  disabled = false,
  children,
  ...props
}: InviteMembersButtonViewProps): ReactElement {
  const m = useMessages('inviteMembersButton');

  return (
    <>
      <Button
        {...mergeProps<'button'>({ onClick: onInvite }, props)}
        disabled={disabled || isInviteDisabled}
      >
        {children ?? m.label}
      </Button>
      {inviteDialog ? <OrganizationProfileInviteMembersDialog {...inviteDialog} /> : null}
    </>
  );
}
