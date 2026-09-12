import { Section } from '../components/section';
import type { UserProfileMenuAction } from './user-profile-action-menu';
import { UserProfileActionMenu } from './user-profile-action-menu';
import { UserProfileSecurityIcon } from './user-profile-security-icon';
import { UserProfileSecurityList } from './user-profile-security-list';

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
  onManage?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function UserProfilePasskeysSectionView({
  passkeys,
  sectionTitle,
  onAdd,
  onManage,
  onRemove,
}: UserProfilePasskeysSectionViewProps) {
  return (
    <UserProfileSecurityList
      addLabel='Add passkey'
      emptyLabel='No passkeys added'
      hasItems={passkeys.length > 0}
      label='Passkeys'
      sectionTitle={sectionTitle}
      onAdd={onAdd}
    >
      {passkeys.map(passkey => {
        const actions: UserProfileMenuAction[] = [];

        if (onManage) {
          actions.push({ label: 'Rename', onClick: () => onManage(passkey.id) });
        }
        if (onRemove) {
          actions.push({ label: 'Remove passkey', color: 'negative', onClick: () => onRemove(passkey.id) });
        }

        return (
          <Section.Item key={passkey.id}>
            <UserProfileSecurityIcon name='passkey' />
            <Section.Content>
              <Section.Label>{passkey.name}</Section.Label>
              {passkey.createdAtLabel || passkey.lastUsedAtLabel ? (
                <Section.Description>
                  {[passkey.createdAtLabel, passkey.lastUsedAtLabel].filter(Boolean).join(' · ')}
                </Section.Description>
              ) : null}
            </Section.Content>
            <Section.Actions>
              <UserProfileActionMenu
                actions={actions}
                label={`Manage ${passkey.name}`}
              />
            </Section.Actions>
          </Section.Item>
        );
      })}
    </UserProfileSecurityList>
  );
}
