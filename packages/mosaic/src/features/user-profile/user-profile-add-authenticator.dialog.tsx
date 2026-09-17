import { Card } from '../../components/card';
import type { DialogFocusTarget, DialogTriggerProps } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import type { UserProfileAddAuthenticatorViewProps } from './user-profile-add-authenticator.view';
import { UserProfileAddAuthenticatorView } from './user-profile-add-authenticator.view';

export interface UserProfileAddAuthenticatorDialogProps extends Omit<UserProfileAddAuthenticatorViewProps, 'onCancel'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  finalFocus?: DialogFocusTarget;
}

export function UserProfileAddAuthenticatorDialog({
  open,
  onOpenChange,
  trigger,
  finalFocus,
  ...props
}: UserProfileAddAuthenticatorDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <Dialog.Popup
        variant='card'
        finalFocus={finalFocus}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <UserProfileAddAuthenticatorView
            {...props}
            onCancel={() => onOpenChange(false)}
          />
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
