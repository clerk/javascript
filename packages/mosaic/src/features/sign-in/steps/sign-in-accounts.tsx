import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';

import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { Icon } from '../../../components/icon';
import { Item } from '../../../components/item';
import { Spinner } from '../../../components/spinner';
import { Plus } from '../../../icons/glyphs/plus';
import { useMessages } from '../../../localization';
import { Button as HeadlessButton } from '../../../primitives/button';
import { RowAvatar } from '../../switcher/switcher-avatar.view';
import type { SignInAccount } from '../sign-in.types';

interface SignInAccountsProps {
  accounts: readonly SignInAccount[];
  globalErrorMessage?: string;
  pendingAccountId?: string;
  isDisabled: boolean;
  onSelectAccount: (id: string) => void;
  onAddAccount?: () => void;
  onSignOutAll?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInAccounts({
  accounts,
  globalErrorMessage,
  pendingAccountId,
  isDisabled,
  onSelectAccount,
  onAddAccount,
  onSignOutAll,
  focusRef,
}: SignInAccountsProps) {
  const m = useMessages('signIn');
  const firstRowRef = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);

  return (
    <>
      <Card.Header>
        <Card.Title>{m.accounts.title}</Card.Title>
        <Card.Description>{m.accounts.description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content>
        <Item.Group>
          {accounts.map((account, index) => (
            <Item.Root
              key={account.id}
              ref={index === 0 ? firstRowRef : undefined}
              aria-busy={pendingAccountId === account.id || undefined}
              render={
                <HeadlessButton
                  disabled={isDisabled}
                  focusableWhenDisabled
                />
              }
              onClick={() => onSelectAccount(account.id)}
            >
              <Item.Media>
                <RowAvatar
                  name={account.name}
                  imageUrl={account.imageUrl}
                  shape='circle'
                  size='fit'
                />
              </Item.Media>
              <Item.Content>
                <Item.Label>{account.name}</Item.Label>
                <Item.Description>{account.identifier}</Item.Description>
              </Item.Content>
              {pendingAccountId === account.id ? (
                <Item.Media>
                  <Spinner
                    size='sm'
                    label={m.verifying}
                  />
                </Item.Media>
              ) : null}
            </Item.Root>
          ))}
        </Item.Group>
      </Card.Content>
      {onAddAccount || onSignOutAll ? (
        <Card.Footer>
          {onSignOutAll ? (
            <Button
              type='button'
              variant='ghost'
              color='neutral'
              disabled={isDisabled}
              focusableWhenDisabled
              onClick={onSignOutAll}
            >
              {m.accounts.signOutAll}
            </Button>
          ) : null}
          {onAddAccount ? (
            <Button
              type='button'
              variant='outline'
              color='neutral'
              disabled={isDisabled}
              focusableWhenDisabled
              onClick={onAddAccount}
            >
              <Icon glyph={Plus} />
              {m.accounts.addAccount}
            </Button>
          ) : null}
        </Card.Footer>
      ) : null}
    </>
  );
}
