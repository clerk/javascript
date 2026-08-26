import { SubmitButton } from '../components/button';
import { Icon } from '../components/icon';
import { Section } from '../components/section';
import type { UserProfilePasskeyCreationState } from './dialogs/flow.types';
import type { UserProfileMenuAction } from './user-profile-action-menu';
import { UserProfileActionMenu } from './user-profile-action-menu';
import { fill, userProfileSecurityBase as m } from './user-profile-security.messages';
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
  creationState?: UserProfilePasskeyCreationState | null;
  onAdd?: () => void;
  onManage?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function UserProfilePasskeysSectionView({
  passkeys,
  sectionTitle,
  creationState,
  onAdd,
  onManage,
  onRemove,
}: UserProfilePasskeysSectionViewProps) {
  return (
    <UserProfileSecurityList
      addControl={
        onAdd ? (
          <SubmitButton
            type='button'
            aria-label={m.passkeys.addTitle}
            color='neutral'
            disabled={creationState?.capability === 'unsupported'}
            isPending={Boolean(creationState?.isSubmitting)}
            pendingLabel={m.passkeys.addPending}
            size='sm'
            variant='outline'
            onClick={onAdd}
          >
            <Icon
              name='plus'
              placement='inline-start'
              size='sm'
            />
            {m.sections.add}
          </SubmitButton>
        ) : null
      }
      addLabel={m.passkeys.addTitle}
      emptyLabel={m.sections.noPasskeys}
      hasItems={passkeys.length > 0}
      label={m.sections.passkeys}
      notice={
        creationState?.errors.form ? (
          <Section.Description role='alert'>{creationState.errors.form}</Section.Description>
        ) : null
      }
      sectionTitle={sectionTitle}
    >
      {passkeys.map(passkey => {
        const actions: UserProfileMenuAction[] = [];

        if (onManage) {
          actions.push({ label: m.sections.rename, onClick: () => onManage(passkey.id) });
        }
        if (onRemove) {
          actions.push({ label: m.common.remove, color: 'negative', onClick: () => onRemove(passkey.id) });
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
                label={fill(m.sections.manage, { name: passkey.name })}
              />
            </Section.Actions>
          </Section.Item>
        );
      })}
    </UserProfileSecurityList>
  );
}
