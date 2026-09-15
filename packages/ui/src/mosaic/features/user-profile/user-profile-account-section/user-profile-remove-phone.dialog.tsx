import * as stylex from '@stylexjs/stylex';

import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Dialog } from '../../../components/dialog';
import { styles } from '../user-profile-profile-panel.styles';
import { userProfileAccountSectionBase as m } from './user-profile-account-section.messages';

export interface UserProfileRemovePhoneDialogProps {
  phoneNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function UserProfileRemovePhoneDialog({
  phoneNumber,
  open,
  onOpenChange,
  onConfirm,
}: UserProfileRemovePhoneDialogProps) {
  const [beforePhone, afterPhone] = m.phone.removeDialog.description.split('{phoneNumber}');

  return (
    <Dialog.Root
      role='alertdialog'
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Popup compactPlacement='sheet'>
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>{m.phone.removeDialog.title}</Card.Title>
            <Card.Description>
              {beforePhone}
              <strong {...stylex.props(styles.confirmPhoneNumber)}>{phoneNumber}</strong>
              {afterPhone}
            </Card.Description>
          </Card.Header>
          <Card.Footer>
            <Dialog.Close
              render={
                <Button
                  variant='outline'
                  fullWidth
                />
              }
            >
              {m.phone.removeDialog.cancel}
            </Dialog.Close>
            <Button
              color='negative'
              fullWidth
              onClick={onConfirm}
            >
              {m.phone.removeDialog.confirm}
            </Button>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
