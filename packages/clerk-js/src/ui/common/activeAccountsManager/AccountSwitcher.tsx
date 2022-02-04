// @ts-ignore
import { default as UserPlusIcon } from '@clerk/shared/assets/icons/user-plus.svg';
import { Avatar } from '@clerk/shared/components/avatar';
import { Button } from '@clerk/shared/components/button';
import { SessionResource } from '@clerk/types';
import React from 'react';

type AccountSwitcherProps = {
  sessions: SessionResource[];
  handleAccountClick: (session: SessionResource) => void;
  handleAddAccountClick: () => void;
  isSingleSession: boolean;
};

export default function AccountSwitcher({
  sessions,
  handleAccountClick,
  handleAddAccountClick,
  isSingleSession,
}: AccountSwitcherProps): JSX.Element {
  return (
    <div className='cl-account-switcher'>
      {sessions.map(session => (
        <AccountButton
          key={session.id}
          onClick={handleAccountClick}
          session={session}
        />
      ))}
      {!isSingleSession && (
        <Button
          className='cl-account-switcher-button cl-account-switcher-add-button'
          onClick={handleAddAccountClick}
          flavor='text'
          hoverable
        >
          <div className='cl-account-switcher-add-button-icon'>
            <UserPlusIcon />
          </div>
          <span>Add account</span>
        </Button>
      )}
    </div>
  );
}

type AccountButtonProps = {
  onClick: (session: SessionResource) => void;
  session: SessionResource;
};
function AccountButton({ session, onClick }: AccountButtonProps): JSX.Element {
  return (
    <Button
      key={session.id}
      onClick={() => onClick(session)}
      className='cl-account-switcher-button'
      flavor='text'
      hoverable
    >
      <Avatar
        className='cl-user-button-avatar'
        firstName={session.publicUserData.firstName || ''}
        lastName={session.publicUserData.lastName || ''}
        profileImageUrl={session.publicUserData.profileImageUrl}
        size={36}
        optimize
      />
      <div className='cl-details'>
        {session.publicUserData.firstName && (
          <span>
            {session.publicUserData.firstName} {session.publicUserData.lastName}
          </span>
        )}
        <span>{session.publicUserData.identifier}</span>
      </div>
    </Button>
  );
}
