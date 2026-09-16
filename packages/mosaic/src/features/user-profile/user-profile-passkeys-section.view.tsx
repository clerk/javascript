import { useMemo } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { Section } from '../../components/section';
import { fill } from '../../utils/messages';
import { UserProfilePasskeyRowView } from './user-profile-passkey-row.view';
import { userProfilePasskeysMessages as m } from './user-profile-passkeys-section.messages';

export interface UserProfilePasskey {
  id: string;
  name: string;
  createdAtLabel?: string;
  lastUsedAtLabel?: string;
}

export interface UserProfilePasskeysSectionViewProps {
  passkeys: UserProfilePasskey[];
  isVisible?: boolean;
  sectionTitle?: string;
  onAdd?: () => void;
  addError?: string;
  onRename?: (id: string, name: string) => void | Promise<void>;
  onManage?: (id: string) => void;
  onRemove?: (id: string) => void | Promise<void>;
}

export function UserProfilePasskeysSectionView({
  passkeys,
  isVisible = true,
  sectionTitle,
  onAdd,
  addError,
  onRename,
  onManage,
  onRemove,
}: UserProfilePasskeysSectionViewProps) {
  const removePasskey = useMemo(() => Confirmation.createHandle<UserProfilePasskey>(), []);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <Section.Root aria-label={sectionTitle ? undefined : m.label}>
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
                    aria-label={m.add}
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
            {addError ? <Section.Error>{addError}</Section.Error> : null}
            {passkeys.length > 0 ? (
              <Section.Items>
                {passkeys.map(passkey => (
                  <UserProfilePasskeyRowView
                    key={passkey.id}
                    passkey={passkey}
                    onRename={onRename}
                    onManage={onManage}
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
          onConfirm={passkey => onRemove(passkey.id)}
        />
      ) : null}
    </>
  );
}
