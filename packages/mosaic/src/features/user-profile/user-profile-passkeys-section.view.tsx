import { useMemo, useRef } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { Button } from '../../components/button';
import { Field } from '../../components/field';
import { Icon } from '../../components/icon';
import { Section } from '../../components/section';
import { useListRemovalFocus } from '../../hooks/useListRemovalFocus';
import { fill } from '../../localization/messages';
import { UserProfilePasskeyRowView } from './user-profile-passkey-row.view';
import { userProfilePasskeysMessages as m } from './user-profile-passkeys-section.messages';
import { styles } from './user-profile-passkeys-section.styles';

export interface UserProfilePasskey {
  id: string;
  name: string;
  createdAtLabel?: string;
  lastUsedAtLabel?: string;
}

export interface UserProfilePasskeysSectionViewProps {
  passkeys: UserProfilePasskey[];
  sectionTitle?: string;
  onAdd?: () => void;
  addError?: string;
  onRename?: (id: string, name: string) => void | Promise<void>;
  onRemove?: (id: string) => void | Promise<void>;
}

export function UserProfilePasskeysSectionView({
  passkeys,
  sectionTitle,
  onAdd,
  addError,
  onRename,
  onRemove,
}: UserProfilePasskeysSectionViewProps) {
  const addButton = useRef<HTMLButtonElement>(null);
  const section = useRef<HTMLElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: passkeys.map(passkey => passkey.id),
    onRemove,
    fallback: () => addButton.current ?? section.current,
  });
  const removePasskey = useMemo(() => Confirmation.createHandle<UserProfilePasskey>(), []);

  return (
    <>
      <Section.Root
        ref={section}
        tabIndex={-1}
        aria-label={sectionTitle ? undefined : m.label}
      >
        {sectionTitle ? <Section.Title>{sectionTitle}</Section.Title> : null}
        <Section.Group>
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Label>{m.label}</Section.Label>
              </Section.Content>
              {onAdd ? (
                <Section.Actions>
                  <Button
                    ref={addButton}
                    aria-label={m.addLabel}
                    color='neutral'
                    size='sm'
                    variant='outline'
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
            </Section.Item>
            <Field.Message
              role={addError ? 'alert' : 'status'}
              xstyle={styles.addError}
            >
              <Field.Error>{addError}</Field.Error>
            </Field.Message>
            {passkeys.length > 0 ? (
              <Section.Items>
                {passkeys.map(passkey => (
                  <UserProfilePasskeyRowView
                    key={passkey.id}
                    passkey={passkey}
                    triggerRef={removalFocus.registerTrigger(passkey.id)}
                    onRename={onRename}
                    onRemove={onRemove ? () => removePasskey.open(passkey) : undefined}
                  />
                ))}
              </Section.Items>
            ) : (
              <Section.Items>
                <Section.Item>
                  <Section.Content>
                    <Section.Description>{m.empty}</Section.Description>
                  </Section.Content>
                </Section.Item>
              </Section.Items>
            )}
          </Section.Row>
        </Section.Group>
      </Section.Root>
      {onRemove ? (
        <Confirmation
          handle={removePasskey}
          title={m.removeTitle}
          description={passkey => fill(m.removeDescription, { name: passkey.name })}
          actionLabel={m.remove}
          finalFocus={removalFocus.finalFocus}
          onConfirm={passkey => removalFocus.remove(passkey.id)}
        />
      ) : null}
    </>
  );
}
