import { type Ref, useState } from 'react';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import { Icon } from '../../components/icon';
import { useMessages } from '../../localization';
import { UserProfileAddMfaView } from './user-profile-add-mfa.view';
import type { UserProfileMfaAddableMethod } from './user-profile-mfa-section.view';

interface UserProfileAddMfaDialogProps {
  methods: readonly UserProfileMfaAddableMethod[];
  onSelect: (type: UserProfileMfaAddableMethod) => void;
  disabled?: boolean;
  triggerRef?: Ref<HTMLButtonElement>;
}

export function UserProfileAddMfaDialog({ methods, onSelect, disabled, triggerRef }: UserProfileAddMfaDialogProps) {
  const m = useMessages('userProfileMfa');
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={setOpen}
    >
      <Dialog.Trigger
        ref={triggerRef}
        aria-label={m.addLabel}
        disabled={disabled}
        render={
          <Button
            color='neutral'
            size='sm'
            variant='outline'
          />
        }
      >
        <Icon
          name='plus'
          placement='inline-start'
          size='sm'
        />
        {m.add}
      </Dialog.Trigger>
      <Dialog.Popup variant='card'>
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <UserProfileAddMfaView
            methods={methods}
            onSelect={type => {
              onSelect(type);
              setOpen(false);
            }}
          />
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
