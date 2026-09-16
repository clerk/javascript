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
  strong: (children?: ReactNode) => <strong {...stylex.props(styles.confirmationContactValue)}>{children}</strong>,
};

export interface UserProfileRemoveEmailDialogProps {
  emailAddress: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function UserProfileRemoveEmailDialog({
  emailAddress,
  open,
  onOpenChange,
  onConfirm,
}: UserProfileRemoveEmailDialogProps) {
  return (
    <Dialog.Root
      role='alertdialog'
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Popup>
        <Dialog.Title render={<Heading size='sm' />}>{m.email.removeDialog.title}</Dialog.Title>
        <Dialog.Description render={<Text />}>
          {rich(m.email.removeDialog.description, { values: { emailAddress }, components })}
        </Dialog.Description>
        <Dialog.Actions>
          <Dialog.Close render={<Button variant='outline' />}>{m.email.removeDialog.cancel}</Dialog.Close>
          <Button
            color='negative'
            onClick={onConfirm}
          >
            {m.email.removeDialog.confirm}
          </Button>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
