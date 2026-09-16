import * as stylex from '@stylexjs/stylex';
import { useId, useState } from 'react';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import { Icon, IconFrame } from '../../components/icon';
import { Item } from '../../components/item';
import { focusOutline } from '../../utils/focus-outline.styles';
import { visuallyHidden } from '../../utils/visually-hidden.styles';
import { styles } from './user-profile-add-mfa.styles';
import { userProfileMfaMessages as m } from './user-profile-mfa-section.messages';
import type { UserProfileMfaAddableMethod } from './user-profile-mfa-section.view';

interface UserProfileAddMfaDialogProps {
  methods: readonly UserProfileMfaAddableMethod[];
  onContinue: (type: UserProfileMfaAddableMethod) => void;
  disabled?: boolean;
}

const icons = {
  sms: 'security-phone',
  authenticator: 'security-lock-square',
  'backup-codes': 'numbers',
} as const;

export function UserProfileAddMfaDialog({ methods, onContinue, disabled }: UserProfileAddMfaDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
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
        <MethodPicker
          methods={methods}
          onContinue={onContinue}
        />
      </Dialog.Popup>
    </Dialog.Root>
  );
}

function MethodPicker({ methods, onContinue }: Pick<UserProfileAddMfaDialogProps, 'methods' | 'onContinue'>) {
  const [selected, setSelected] = useState<UserProfileMfaAddableMethod>();
  const id = useId();
  const choice = selected && methods.includes(selected) ? selected : undefined;

  return (
    <Card.Root
      elevation='overlay'
      renderBranding={false}
    >
      <Card.Header>
        <Card.Title>{m.addDialog.title}</Card.Title>
        <Card.Description>{m.addDialog.description}</Card.Description>
      </Card.Header>
      <Card.Content>
        <Item.Group
          variant='outline'
          role='radiogroup'
          aria-label={m.addDialog.description}
        >
          {methods.map(type => (
            <Item.Root
              key={type}
              size='lg'
              render={<label />}
              xstyle={[styles.option, focusOutline.within, choice === type && styles.selected]}
            >
              <input
                {...stylex.props(visuallyHidden.base)}
                type='radio'
                name={id}
                value={type}
                checked={choice === type}
                onChange={() => setSelected(type)}
                aria-labelledby={`${id}-${type}-label`}
                aria-describedby={`${id}-${type}-description`}
              />
              <Item.Media render={<span />}>
                <IconFrame filled>
                  <Icon
                    name={icons[type]}
                    size='lg'
                    aria-hidden
                  />
                </IconFrame>
              </Item.Media>
              <Item.Content render={<span />}>
                <Item.Label
                  render={<span />}
                  id={`${id}-${type}-label`}
                >
                  {m.methods[type]}
                </Item.Label>
                <Item.Description
                  render={<span />}
                  id={`${id}-${type}-description`}
                  xstyle={styles.description}
                >
                  {m.addDialog.methods[type]}
                </Item.Description>
              </Item.Content>
            </Item.Root>
          ))}
        </Item.Group>
      </Card.Content>
      <Card.Footer>
        <Dialog.Close
          disabled={!choice}
          render={<Button fullWidth />}
          onClick={() => {
            if (choice) {
              onContinue(choice);
            }
          }}
        >
          {m.addDialog.continue}
        </Dialog.Close>
      </Card.Footer>
    </Card.Root>
  );
}
