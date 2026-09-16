import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

import { Button } from '../../../components/button';
import { Dialog } from '../../../components/dialog';
import { Heading } from '../../../components/heading';
import { Text } from '../../../components/text';
import { rich } from '../../../utils/messages';
import { styles } from '../user-profile-profile-panel.styles';
import { userProfileAccountSectionMessages as m } from './user-profile-account-section.messages';

const components = {
  strong: (children?: ReactNode) => <strong {...stylex.props(styles.confirmPhoneNumber)}>{children}</strong>,
};

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
  return (
    <Dialog.Root
      role='alertdialog'
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Popup>
        <Dialog.Title render={<Heading size='sm' />}>{m.phone.removeDialog.title}</Dialog.Title>
        <Dialog.Description render={<Text />}>
          {rich(m.phone.removeDialog.description, { values: { phoneNumber }, components })}
        </Dialog.Description>
        <Dialog.Actions>
          <Dialog.Close render={<Button variant='outline' />}>{m.phone.removeDialog.cancel}</Dialog.Close>
          <Button
            color='negative'
            onClick={onConfirm}
          >
            {m.phone.removeDialog.confirm}
          </Button>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
