import { Card } from '../../components/card';
import type { DialogFocusTarget, DialogTriggerProps } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import type { UserProfileBackupCodesViewProps } from './user-profile-backup-codes.view';
import { UserProfileBackupCodesView } from './user-profile-backup-codes.view';

export interface UserProfileBackupCodesDialogProps extends Omit<UserProfileBackupCodesViewProps, 'onCancel'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  finalFocus?: DialogFocusTarget;
}

export function UserProfileBackupCodesDialog({
  open,
  onOpenChange,
  trigger,
  finalFocus,
  ...props
}: UserProfileBackupCodesDialogProps) {
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
          <UserProfileBackupCodesView
            {...props}
            onCancel={() => onOpenChange(false)}
          />
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
