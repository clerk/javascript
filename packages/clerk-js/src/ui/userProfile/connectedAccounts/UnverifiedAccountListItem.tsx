import { ArrowRightIcon } from '@clerk/shared/assets/icons';
import { List } from '@clerk/shared/components/list';
import { Spinner } from '@clerk/shared/components/spinner';
import { VerificationStatusTag } from '@clerk/shared/components/tag';
import type { ExternalAccountResource } from '@clerk/types';
import { OAuthStrategy } from '@clerk/types';
import React from 'react';
import { svgUrl } from 'ui/common/constants';

type UnverifiedAccountListItemProps = {
  externalAccount: ExternalAccountResource;
  handleConnect: (strategy: OAuthStrategy) => void;
  isBusy: boolean;
  isDisabled: boolean;
};

export function UnverifiedAccountListItem({
  externalAccount,
  handleConnect,
  isBusy,
  isDisabled,
}: UnverifiedAccountListItemProps): JSX.Element {
  return (
    <List.Item
      className='cl-list-item'
      key={externalAccount.id}
      onClick={() => handleConnect(`oauth_${externalAccount.provider}`)}
      detailIcon={isBusy ? <Spinner /> : <ArrowRightIcon />}
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
