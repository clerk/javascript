import { useMergeRefs } from '@floating-ui/react';
import { type ReactNode, type Ref, useRef } from 'react';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import { Icon } from '../../components/icon';
import { useMessages } from '../../localization';

export interface UserProfileAddMfaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  disabled?: boolean;
  triggerRef?: Ref<HTMLButtonElement>;
}

export function UserProfileAddMfaDialog({
  open,
  onOpenChange,
  children,
  disabled,
  triggerRef: triggerRefProp,
}: UserProfileAddMfaDialogProps) {
  const m = useMessages('userProfileMfa');
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useMergeRefs([triggerRefProp, addButtonRef]);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
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
      <Dialog.Popup
        variant='card'
        finalFocus={addButtonRef}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          {children}
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
