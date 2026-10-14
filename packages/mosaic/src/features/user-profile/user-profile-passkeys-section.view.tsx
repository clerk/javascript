import type { Ref } from 'react';

import type { ConfirmController } from '../../blocks/confirm';
import { Confirmation } from '../../blocks/confirmation';
import { Button } from '../../components/button';
import type { DialogFocusTarget } from '../../components/dialog';
import { Field } from '../../components/field';
import { Icon } from '../../components/icon';
import { Section } from '../../components/section';
import { fill, useMessages } from '../../localization';
import { UserProfilePasskeyRowView } from './user-profile-passkey-row.view';
import { styles } from './user-profile-passkeys-section.styles';
import type {
  UserProfilePasskey,
  UserProfilePasskeyNameValidator,
} from './user-profile-passkeys-section/user-profile-passkeys-section.types';

export type { UserProfilePasskey } from './user-profile-passkeys-section/user-profile-passkeys-section.types';

export interface UserProfilePasskeysSectionViewProps {
  passkeys: UserProfilePasskey[];
  sectionRef?: Ref<HTMLDivElement>;
  addButtonRef?: Ref<HTMLButtonElement>;
  onAdd?: () => void;
  isAdding?: boolean;
  addError?: string;
  onRename?: (id: string, name: string) => void | Promise<void>;
  validateName?: UserProfilePasskeyNameValidator;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
  remove?: ConfirmController<UserProfilePasskey>;
  finalFocus?: DialogFocusTarget;
}

export function UserProfilePasskeysSectionView({
  passkeys,
  sectionRef,
  addButtonRef,
  onAdd,
  isAdding,
  addError,
  onRename,
  validateName,
  registerTrigger,
  remove,
  finalFocus,
}: UserProfilePasskeysSectionViewProps) {
  const m = useMessages('userProfilePasskeys');

  return (
    <>
      <Section.Group
        ref={sectionRef}
        tabIndex={-1}
      >
        <Section.Header>
          <Section.Content>
            <Section.Title>{m.label}</Section.Title>
            <Field.Message
              role={addError ? 'alert' : 'status'}
              xstyle={styles.addError}
            >
              <Field.Error>{addError}</Field.Error>
            </Field.Message>
          </Section.Content>
          {onAdd ? (
            <Section.Actions>
              <Button
                ref={addButtonRef}
                aria-label={m.addLabel}
                color='neutral'
                size='sm'
                variant='outline'
                disabled={isAdding}
                aria-busy={isAdding}
                onClick={onAdd}
              >
                <Icon
                  name='plus'
                  placement='inline-start'
                  size='sm'
                />
                {m.add}
              </Button>
            </Section.Actions>
          ) : null}
        </Section.Header>
        <Section.Body>
          <Section.Items>
            {passkeys.length > 0 ? (
              passkeys.map(passkey => (
                <UserProfilePasskeyRowView
                  key={passkey.id}
                  passkey={passkey}
                  triggerRef={registerTrigger(passkey.id)}
                  onRename={onRename}
                  validateName={validateName}
                  onRemove={remove ? () => remove.open(passkey) : undefined}
                />
              ))
            ) : (
              <Section.Item>
                <Section.Content>
                  <Section.Description>{m.empty}</Section.Description>
                </Section.Content>
              </Section.Item>
            )}
          </Section.Items>
        </Section.Body>
      </Section.Group>
      {remove ? (
        <Confirmation
          controller={remove}
          title={m.removeTitle}
          description={passkey => fill(m.removeDescription, { name: passkey.name })}
          actionLabel={m.remove}
          cancelLabel={m.cancel}
          finalFocus={finalFocus}
        />
      ) : null}
    </>
  );
}
