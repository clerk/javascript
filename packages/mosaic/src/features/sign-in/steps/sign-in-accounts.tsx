import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';

import { Avatar } from '../../../components/avatar';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { Icon, IconFrame } from '../../../components/icon';
import { Item } from '../../../components/item';
import { Spinner } from '../../../components/spinner';
import { ChevronRight } from '../../../icons/glyphs/chevron-right';
import { Plus } from '../../../icons/glyphs/plus';
import { useMessages } from '../../../localization';
import { rtl } from '../../../styles/rtl.styles';
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
              render={
                <button
                  type='button'
                  disabled={isDisabled}
                  onClick={() => onSelectAccount(account.id)}
                />
              }
            >
              <Item.Media>
                <Avatar.Root aria-hidden>
                  {account.imageUrl ? (
                    <Avatar.Image
                      src={account.imageUrl}
                      alt=''
                    />
                  ) : null}
                  <Avatar.Fallback />
                </Avatar.Root>
              </Item.Media>
              <Item.Content>
                <Item.Label>{account.name}</Item.Label>
                <Item.Description>{account.identifier}</Item.Description>
              </Item.Content>
              <Item.Actions>
                {pendingAccountId === account.id ? (
                  <Spinner
                    size='sm'
                    label={m.verifying}
                  />
                ) : (
                  <Icon
                    glyph={ChevronRight}
                    xstyle={rtl.mirror}
                  />
                )}
              </Item.Actions>
            </Item.Root>
          ))}
          {onAddAccount ? (
            <Item.Root
              render={
                <button
                  type='button'
                  disabled={isDisabled}
                  onClick={onAddAccount}
                />
              }
            >
              <Item.Media>
                <IconFrame
                  filled
                  bordered={false}
                >
                  <Icon glyph={Plus} />
                </IconFrame>
              </Item.Media>
              <Item.Content>
                <Item.Label>{m.accounts.addAccount}</Item.Label>
              </Item.Content>
            </Item.Root>
          ) : null}
          {onSignOutAll ? (
            <Button
              type='button'
              color='neutral'
              variant='ghost'
              disabled={isDisabled}
              onClick={onSignOutAll}
            >
              {m.accounts.signOutAll}
            </Button>
          ) : null}
        </Item.Group>
      </Card.Content>
    </>
  );
}
