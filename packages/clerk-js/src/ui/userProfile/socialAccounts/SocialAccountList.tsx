import { List } from '@clerk/shared/components/list';
import { TitledCard } from '@clerk/shared/components/titledCard';
import { ExternalAccountResource, OAuthProvider, OAuthStrategy } from '@clerk/types';
import React, { useState } from 'react';
import { Alert } from 'ui/common/alert';
import { useCoreUser, useEnvironment } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { PageHeading } from 'ui/userProfile/pageHeading';

import { UnconnectedAccountListItem } from './UnconnectedAccountListItem';
import { UnverifiedAccountListItem } from './UnverifiedAccountListItem';
import { VerifiedAccountListItem } from './VerifiedAccountListItem';

export function SocialAccountList(): JSX.Element {
  return (
    <>
      <PageHeading
        title='Social accounts'
        backTo='../'
      />

      <TitledCard className='cl-themed-card cl-list-card'>
        <SocialAccountListRows />
      </TitledCard>
    </>
  );
}

function SocialAccountListRows(): JSX.Element {
  const [error, setError] = useState<string | undefined>();
  const [busyProvider, setBusyProvider] = useState<OAuthStrategy | null>(null);
  const user = useCoreUser();
  const { navigate } = useNavigate();
  const {
    userSettings: { social },
  } = useEnvironment();

  const availableProviders = Object.values(social).filter(oauthProvider => oauthProvider.enabled);

  const verifiedAccounts = user.verifiedExternalAccounts;
  const verifiedProviders = verifiedAccounts.map(externalAccount => externalAccount.provider);

  // To avoid visual clutter, filter out external accounts for which there is no error set (potentially abandoned flows)
  const unverifiedAccounts = user.unverifiedExternalAccounts.filter(
    externalAccount => !!externalAccount?.verification?.error,
  );
  const unverifiedProviders = unverifiedAccounts.map(externalAccount => externalAccount.provider);

  const unconnectedProviders = availableProviders.filter(oauthProvider => {
    const provider = oauthProvider.strategy.replace('oauth_', '') as OAuthProvider; // :-(
    return !verifiedProviders.includes(provider) && !unverifiedProviders.includes(provider);
  });

  const handleConnect = (strategy: OAuthStrategy) => {
    setError(undefined);
    setBusyProvider(strategy);

    user
      .createExternalAccount({ strategy: strategy, redirect_url: window.location.href })
      .then(externalAccount => {
        navigate(externalAccount.verification!.externalVerificationRedirectURL);
      })
      .catch(err => {
        setError(err.message || err);
        setBusyProvider(null);
        console.log(err);
      });
  };

  const handleDisconnect = (externalAccount: ExternalAccountResource) => {
    return externalAccount.destroy();
  };

  if (availableProviders.length == 0) {
    return <div className='cl-empty-list-item'>There are no available external account providers</div>;
  }

  return (
    <>
      <Alert type='error'>{error}</Alert>

      <List>
        {verifiedAccounts.map(externalAccount => (
          <VerifiedAccountListItem
            key={externalAccount.id}
            externalAccount={externalAccount}
            isDisabled={!!busyProvider}
          />
        ))}

        {unverifiedAccounts.map(externalAccount => (
          <UnverifiedAccountListItem
            key={externalAccount.id}
            externalAccount={externalAccount}
            handleConnect={handleConnect}
            handleDisconnect={handleDisconnect}
            isBusy={busyProvider == `oauth_${externalAccount.provider}`}
            isDisabled={!!busyProvider}
          />
        ))}

        {unconnectedProviders.map(unconnectedProvider => (
          <UnconnectedAccountListItem
            key={unconnectedProvider.strategy}
            oauthProviderSettings={unconnectedProvider}
            handleConnect={handleConnect}
            isBusy={busyProvider == unconnectedProvider.strategy}
            isDisabled={!!busyProvider}
          />
        ))}
      </List>
    </>
  );
}
