import type { Ref } from 'react';

import type { ConfirmController } from '../../../blocks/confirm';
import { Confirmation } from '../../../blocks/confirmation';
import { ReverificationDialog } from '../../../blocks/reverification';
import { Button } from '../../../components/button';
import type { DialogFocusTarget } from '../../../components/dialog';
import { Field } from '../../../components/field';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { Plus } from '../../../icons/glyphs/plus';
import { fill, useMessages } from '../../../localization';
import type { ReverificationController } from '../../reverification';
import { UserProfilePasskeyRowView } from './user-profile-passkey-row.view';
import { styles } from './user-profile-passkeys-section.styles';
import type { UserProfilePasskey, UserProfilePasskeyNameValidator } from './user-profile-passkeys-section.types';

export type { UserProfilePasskey } from './user-profile-passkeys-section.types';

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
  addReverification?: ReverificationController;
  addFinalFocus?: DialogFocusTarget;
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
  addReverification,
  addFinalFocus,
}: UserProfilePasskeysSectionViewProps) {
  const m = useMessages('userProfile').passkeys;

  return (
    <>
      <Section.Root>
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
                    glyph={Plus}
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
      </Section.Root>
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
      {addReverification ? (
        <ReverificationDialog
          controller={addReverification}
          finalFocus={addFinalFocus}
        />
      ) : null}
    </>
  );
}
