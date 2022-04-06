import { List } from '@clerk/shared/components/list';
import { VerificationStatusTag } from '@clerk/shared/components/tag';
import type { ExternalAccountResource } from '@clerk/types';
import React from 'react';
import { svgUrl } from 'ui/common/constants';
import { useNavigate } from 'ui/hooks';

type VerifiedAccountListItemProps = {
  externalAccount: ExternalAccountResource;
  isDisabled: boolean;
};

export function VerifiedAccountListItem({ externalAccount, isDisabled }: VerifiedAccountListItemProps): JSX.Element {
  const { navigate } = useNavigate();

  return (
    <List.Item
      className='cl-list-item'
      key={externalAccount.id}
      onClick={() => navigate(externalAccount.id)}
      disabled={isDisabled}
    >
      <div>
        <img
          alt={externalAccount.providerTitle()}
          src={svgUrl(externalAccount.providerSlug())}
          className='cl-left-icon-wrapper'
        />
        {externalAccount.username || externalAccount.emailAddress}

        {externalAccount.label && ` (${externalAccount.label})`}

        <VerificationStatusTag
          className='cl-tag'
          status={externalAccount.verification?.status || 'verified'}
        />
      </div>
    </List.Item>
  );
}
