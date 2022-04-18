import { List } from '@clerk/shared/components/list';
import { Menu } from '@clerk/shared/components/menu';
import { Popover } from '@clerk/shared/components/popover';
import { Spinner } from '@clerk/shared/components/spinner';
import { VerificationStatusTag } from '@clerk/shared/components/tag';
import type { ExternalAccountResource } from '@clerk/types';
import { OAuthStrategy } from '@clerk/types';
import React from 'react';
import { svgUrl } from 'ui/common/constants';

type UnverifiedAccountListItemProps = {
  externalAccount: ExternalAccountResource;
  handleConnect: (strategy: OAuthStrategy) => void;
  handleDisconnect: (externalAccount: ExternalAccountResource) => void;
  isBusy: boolean;
  isDisabled: boolean;
};

export function UnverifiedAccountListItem({
  externalAccount,
  handleConnect,
  handleDisconnect,
  isBusy,
  isDisabled,
}: UnverifiedAccountListItemProps): JSX.Element {
  const popoverMenu = (
    <Popover>
      <Menu
        options={[
          {
            label: <span>Reconnect</span>,
            handleSelect: () => handleConnect(`oauth_${externalAccount.provider}`),
          },
          {
            label: <span>Disconnect</span>,
            handleSelect: () => handleDisconnect(externalAccount),
          },
        ]}
      />
    </Popover>
  );

  return (
    <List.Item
      className='cl-list-item'
      key={externalAccount.id}
      detailIcon={isBusy ? <Spinner /> : popoverMenu}
      disabled={isDisabled}
    >
      <div>
        <img
          alt={externalAccount.providerTitle()}
          src={svgUrl(externalAccount.provider)}
          className='cl-left-icon-wrapper'
        />
        {externalAccount.username || externalAccount.emailAddress}

        {externalAccount.label && ` (${externalAccount.label})`}

        <VerificationStatusTag
          className='cl-tag'
          status={externalAccount.verification?.status || 'unverified'}
        />

        <span className='cl-verification-error'>{externalAccount.verification?.error?.longMessage}</span>
      </div>
    </List.Item>
  );
}
