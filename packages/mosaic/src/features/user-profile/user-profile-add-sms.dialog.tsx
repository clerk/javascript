import { useRef } from 'react';

import { Card } from '../../components/card';
import type { DialogFocusTarget, DialogTriggerProps } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import type { UserProfileAddSmsViewProps } from './user-profile-add-sms.view';
import { UserProfileAddSmsView } from './user-profile-add-sms.view';

export interface UserProfileAddSmsDialogProps extends Omit<
  UserProfileAddSmsViewProps,
  'onCancel' | 'selectRef' | 'phoneRef'
> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  finalFocus?: DialogFocusTarget;
}

export function UserProfileAddSmsDialog({
  open,
  onOpenChange,
  trigger,
  finalFocus,
  ...props
}: UserProfileAddSmsDialogProps) {
  const selectRef = useRef<HTMLButtonElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <Dialog.Popup
        variant='card'
        initialFocus={props.step === 'select' ? selectRef : props.step === 'phone' ? phoneRef : undefined}
        finalFocus={finalFocus}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <UserProfileAddSmsView
            {...props}
            onCancel={() => onOpenChange(false)}
            selectRef={selectRef}
            phoneRef={phoneRef}
          />
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
