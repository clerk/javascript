import { useMemo, useRef } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { Button } from '../../components/button';
import { Field } from '../../components/field';
import { Icon } from '../../components/icon';
import { Section } from '../../components/section';
import { useListRemovalFocus } from '../../hooks/use-list-removal-focus';
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
  onAdd?: () => void;
  isAdding?: boolean;
  addError?: string;
  onRename?: (id: string, name: string) => void | Promise<void>;
  validateName?: UserProfilePasskeyNameValidator;
  onRemove?: (id: string) => void | Promise<void>;
}

const byId = (passkey: UserProfilePasskey) => passkey.id;

export function UserProfilePasskeysSectionView({
  passkeys,
  onAdd,
  isAdding,
  addError,
  onRename,
  validateName,
  onRemove,
}: UserProfilePasskeysSectionViewProps) {
  const m = useMessages('userProfilePasskeys');
  const addButton = useRef<HTMLButtonElement>(null);
  const section = useRef<HTMLDivElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: passkeys.map(passkey => passkey.id),
    onRemove,
    fallback: () => addButton.current ?? section.current,
  });
  const removePasskey = useMemo(() => Confirmation.createHandle<UserProfilePasskey>(), []);

  return (
    <>
      <Section.Group
        ref={section}
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
                ref={addButton}
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
          <Section.AnimatedItems
            items={passkeys}
            getKey={byId}
            empty={
              <Section.Content>
                <Section.Description>{m.empty}</Section.Description>
              </Section.Content>
            }
          >
            {(passkey, { present }) => (
              <UserProfilePasskeyRowView
                passkey={passkey}
                triggerRef={present ? removalFocus.registerTrigger(passkey.id) : undefined}
                onRename={onRename}
                validateName={validateName}
                onRemove={onRemove ? () => removePasskey.open(passkey) : undefined}
              />
            )}
          </Section.AnimatedItems>
        </Section.Body>
      </Section.Group>
      {onRemove ? (
        <Confirmation
          handle={removePasskey}
          title={m.removeTitle}
          description={passkey => fill(m.removeDescription, { name: passkey.name })}
          actionLabel={m.remove}
          cancelLabel={m.cancel}
          finalFocus={removalFocus.finalFocus}
          onConfirm={passkey => removalFocus.remove(passkey.id)}
        />
      ) : null}
    </>
  );
}
