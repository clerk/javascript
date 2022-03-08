import { List } from '@clerk/shared/components/list';
import { titleize } from '@clerk/shared/utils/string';
import type { OAuthProvider, OAuthProviderSettings, OAuthStrategy } from '@clerk/types';
import React from 'react';
import { svgUrl } from 'ui/common/constants';

type UnconnectedAccountListItemProps = {
  oauthProviderSettings: OAuthProviderSettings;
  handleConnect: (strategy: OAuthStrategy) => void;
};

export function UnconnectedAccountListItem({
                                             oauthProviderSettings,
                                             handleConnect,
                                           }: UnconnectedAccountListItemProps): JSX.Element {
  const oauthProvider = oauthProviderSettings.strategy.replace('oauth_', '') as OAuthProvider;

  return (
    <List.Item
      className='cl-list-item'
      key={oauthProviderSettings.strategy}
      onClick={() => handleConnect(oauthProviderSettings.strategy)}
    >
      <div>
        <img
          alt={oauthProviderSettings.strategy}
          src={svgUrl(oauthProvider)}
          className='cl-left-icon-wrapper'
        />

        Connect {titleize(oauthProvider)} account
      </div>
    </List.Item>
  );
}
