import * as stylex from '@stylexjs/stylex';
import { useMemo, useState } from 'react';

import { Dialog } from '../../components/dialog';
import { Icon, IconFrame } from '../../components/icon';
import { Section } from '../../components/section';
import { colorVars } from '../../tokens.stylex';
import { fill } from '../../utils/messages';
import type { UserProfileMenuAction } from './user-profile-action-menu';
import { UserProfileActionMenu } from './user-profile-action-menu';
import { userProfilePasskeysMessages as m } from './user-profile-passkeys-section.messages';
import type { UserProfilePasskey } from './user-profile-passkeys-section.view';
import { UserProfileRenamePasskeyDialog } from './user-profile-rename-passkey.dialog';

export function UserProfilePasskeyRowView({
  passkey,
  onRename,
  onManage,
  onRemove,
}: {
  passkey: UserProfilePasskey;
  onRename?: (id: string, name: string) => void | Promise<void>;
  onManage?: (id: string) => void;
  onRemove?: () => void;
}) {
  const renameDialog = useMemo(() => Dialog.createHandle(), []);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(passkey.name);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const description =
    passkey.createdAtLabel && passkey.lastUsedAtLabel
      ? fill(m.details, { createdAt: passkey.createdAtLabel, lastUsedAt: passkey.lastUsedAtLabel })
      : passkey.createdAtLabel || passkey.lastUsedAtLabel;

  const onOpenChange = (nextOpen: boolean) => {
    if (isSaving) {
      return;
    }
    if (nextOpen) {
      setName(passkey.name);
      setError(undefined);
    }
    setOpen(nextOpen);
  };
  const onSubmit = async () => {
    if (!onRename || isSaving || name.length < 2 || name === passkey.name) {
      return;
    }
    setIsSaving(true);
    setError(undefined);
    try {
      await onRename(passkey.id, name);
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : m.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const actions: UserProfileMenuAction[] = [];
  if (onRename) {
    actions.push({ label: m.rename, onClick: () => renameDialog.open(undefined) });
  } else if (onManage) {
    actions.push({ label: m.rename, onClick: () => onManage(passkey.id) });
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
            <UserProfileActionMenu
              actions={actions}
              label={fill(m.manage, { name: passkey.name })}
            />
          </Section.Actions>
        ) : null}
      </Section.Item>
      {onRename ? (
        <UserProfileRenamePasskeyDialog
          handle={renameDialog}
          open={open}
          onOpenChange={onOpenChange}
          name={name}
          onNameChange={setName}
          isSaving={isSaving}
          error={error}
          canSave={name.length > 1 && name !== passkey.name}
          onSubmit={() => void onSubmit()}
        />
      ) : null}
    </>
  );
}

const styles = stylex.create({
  icon: {
    color: colorVars['--cl-color-foreground-secondary'],
  },
});
