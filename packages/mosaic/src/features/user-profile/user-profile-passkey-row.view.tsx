import type { Ref } from 'react';
import { useMemo } from 'react';

import type { ActionMenuAction } from '../../components/action-menu';
import { ActionMenu } from '../../components/action-menu';
import { Dialog } from '../../components/dialog';
import { Icon, IconFrame } from '../../components/icon';
import { Section } from '../../components/section';
import { fill } from '../../localization/messages';
import { userProfilePasskeysMessages as m } from './user-profile-passkeys-section.messages';
import { styles } from './user-profile-passkeys-section.styles';
import type { UserProfilePasskey } from './user-profile-passkeys-section.view';
import { useUserProfileRenamePasskeyController } from './user-profile-rename-passkey.controller';
import { UserProfileRenamePasskeyDialog } from './user-profile-rename-passkey.dialog';

export function UserProfilePasskeyRowView({
  passkey,
  triggerRef,
  onRename,
  onRemove,
}: {
  passkey: UserProfilePasskey;
  triggerRef?: Ref<HTMLButtonElement>;
  onRename?: (id: string, name: string) => void | Promise<void>;
  onRemove?: () => void;
}) {
  const renameDialog = useMemo(() => Dialog.createHandle(), []);
  const controller = useUserProfileRenamePasskeyController({ id: passkey.id, name: passkey.name, onRename });
  const description =
    passkey.createdAtLabel && passkey.lastUsedAtLabel
      ? fill(m.details, { createdAt: passkey.createdAtLabel, lastUsedAt: passkey.lastUsedAtLabel })
      : passkey.createdAtLabel || passkey.lastUsedAtLabel;

  const actions: ActionMenuAction[] = [];
  if (onRename) {
    actions.push({ label: m.rename, onClick: () => renameDialog.open(undefined) });
  }
  if (onRemove) {
    actions.push({ label: m.removeAction, color: 'negative', onClick: onRemove });
  }

  return (
    <>
      <Section.Item>
        <Section.Media size='lg'>
          <IconFrame
            filled
            bordered={false}
          >
            <Icon
              aria-hidden
              name='security-passkey'
              size='md'
              xstyle={styles.icon}
            />
          </IconFrame>
        </Section.Media>
        <Section.Content>
          <Section.Label>{passkey.name}</Section.Label>
          {description ? <Section.Description>{description}</Section.Description> : null}
        </Section.Content>
        {actions.length > 0 ? (
          <Section.Actions>
            <ActionMenu
              triggerRef={triggerRef}
              actions={actions}
              label={fill(m.manage, { name: passkey.name })}
            />
          </Section.Actions>
        ) : null}
      </Section.Item>
      {onRename ? (
        <UserProfileRenamePasskeyDialog
          {...controller}
          handle={renameDialog}
          open={controller.isOpen}
        />
      ) : null}
    </>
  );
}
