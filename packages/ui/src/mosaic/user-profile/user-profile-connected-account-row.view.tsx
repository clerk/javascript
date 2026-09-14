import type { RefObject } from 'react';
import { useRef, useState } from 'react';

import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { Section } from '../components/section';
import type { UserProfileMenuAction } from './user-profile-action-menu';
import { UserProfileActionMenu } from './user-profile-action-menu';
import { userProfileConnectedAccountsMessages as m } from './user-profile-connected-accounts.messages';
import type {
  UserProfileConnectedAccount,
  UserProfileConnectedAccountsSectionViewProps,
} from './user-profile-connected-accounts-section.view';
import { UserProfileProviderIcon } from './user-profile-provider-icon';
import { UserProfileRemoveConnectedAccountDialog } from './user-profile-remove-connected-account.dialog';

interface UserProfileConnectedAccountRowViewProps extends Pick<
  UserProfileConnectedAccountsSectionViewProps,
  'onConnect' | 'onManage' | 'onRemove'
> {
  account: UserProfileConnectedAccount;
  removalFocusRef: RefObject<HTMLElement | null>;
}

export function UserProfileConnectedAccountRowView({
  account,
  onConnect,
  onManage,
  onRemove,
  removalFocusRef,
}: UserProfileConnectedAccountRowViewProps) {
  const [open, setOpen] = useState(false);
  const [removeError, setRemoveError] = useState<string>();
  const removing = useRef(false);
  const confirmedRemoval = useRef(false);
  const connectRef = useRef<HTMLButtonElement>(null);
  const connected = account.connected ?? Boolean(account.identifier);
  const actions: UserProfileMenuAction[] = [];

  const confirmRemove = async () => {
    if (!onRemove || account.canRemove === false || removing.current) {
      return;
    }
    removing.current = true;
    confirmedRemoval.current = true;
    setOpen(false);
    try {
      await onRemove(account.id);
    } catch (error) {
      setRemoveError(error instanceof Error ? error.message : m.removeError);
    } finally {
      removing.current = false;
    }
  };

  if (onRemove && account.canRemove !== false) {
    actions.push({
      label: m.remove,
      color: 'negative',
      onClick: () => {
        if (removing.current) {
          return;
        }
        confirmedRemoval.current = false;
        setRemoveError(undefined);
        setOpen(true);
      },
    });
  } else if (!onRemove && onManage) {
    actions.push({ label: m.manage, onClick: () => onManage(account.id) });
  }

  return (
    <Section.Row>
      <Section.Item>
        {account.iconUrl ? <UserProfileProviderIcon iconUrl={account.iconUrl} /> : null}
        <Section.Content>
          <Section.Label>{account.provider}</Section.Label>
          {account.identifier ? <Section.Description>{account.identifier}</Section.Description> : null}
          {removeError ? <Section.Error role='alert'>{removeError}</Section.Error> : null}
        </Section.Content>
        <Section.Actions>
          {connected ? (
            <UserProfileActionMenu
              actions={actions}
              label={`${m.manage} ${account.provider}`}
            >
              {onRemove && account.canRemove !== false ? (
                <UserProfileRemoveConnectedAccountDialog
                  provider={account.provider}
                  open={open}
                  onOpenChange={setOpen}
                  onConfirm={() => void confirmRemove()}
                  finalFocus={() =>
                    confirmedRemoval.current ? (connectRef.current ?? removalFocusRef.current) : undefined
                  }
                />
              ) : null}
            </UserProfileActionMenu>
          ) : null}
          {!connected && onConnect ? (
            <Button
              ref={connectRef}
              color='neutral'
              size='sm'
              variant='outline'
              onClick={() => onConnect(account.id)}
            >
              {m.connect}
              <Icon
                name='arrow-right-top'
                placement='inline-end'
                size='sm'
              />
            </Button>
          ) : null}
        </Section.Actions>
      </Section.Item>
    </Section.Row>
  );
}
