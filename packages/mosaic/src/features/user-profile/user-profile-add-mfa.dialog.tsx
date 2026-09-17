import type { Ref } from 'react';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import { Icon, IconFrame } from '../../components/icon';
import { Item } from '../../components/item';
import { userProfileMfaMessages as m } from './user-profile-mfa-section.messages';
import type { UserProfileMfaAddableMethod } from './user-profile-mfa-section.view';

interface UserProfileAddMfaDialogProps {
  methods: readonly UserProfileMfaAddableMethod[];
  onSelect: (type: UserProfileMfaAddableMethod) => void;
  disabled?: boolean;
  triggerRef?: Ref<HTMLButtonElement>;
}

const icons = {
  sms: 'security-phone',
  authenticator: 'security-lock-square',
  'backup-codes': 'numbers',
} as const;

export function UserProfileAddMfaDialog({ methods, onSelect, disabled, triggerRef }: UserProfileAddMfaDialogProps) {
  return (
    <Dialog.Root>
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
          <Card.Header>
            <Card.Title>{m.addDialog.title}</Card.Title>
            <Card.Description>{m.addDialog.description}</Card.Description>
          </Card.Header>
          <Card.Content>
            <Item.Group variant='outline'>
              {methods.map(type => (
                <Item.Root
                  key={type}
                  size='lg'
                  render={<Dialog.Close onClick={() => onSelect(type)} />}
                >
                  <Item.Media>
                    <IconFrame filled>
                      <Icon name={icons[type]} />
                    </IconFrame>
                  </Item.Media>
                  <Item.Content>
                    <Item.Label>{m.methods[type]}</Item.Label>
                    <Item.Description>{m.addDialog.methods[type]}</Item.Description>
                  </Item.Content>
                  <Item.Actions>
                    <Icon name='chevron-right' />
                  </Item.Actions>
                </Item.Root>
              ))}
            </Item.Group>
          </Card.Content>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
