import type { ReactNode } from 'react';

import {
  useAccountConnectedAccountsModel,
  useAccountEmailsModel,
  useAccountEnterpriseAccountsModel,
  useAccountPhoneModel,
  useAccountUsernameModel,
  useAccountWeb3Model,
} from './account-sections.model';
import {
  AccountConnectedAccountsView,
  AccountEmailsView,
  AccountEnterpriseAccountsView,
  AccountPhoneView,
  AccountUsernameView,
  AccountWeb3View,
} from './account-sections.view';

export function AccountUsername(): ReactNode {
  const model = useAccountUsernameModel();
  if (!model.available) {
    return null;
  }
  return <AccountUsernameView isImmutable={model.isImmutable} />;
}

export function AccountEmails(): ReactNode {
  const model = useAccountEmailsModel();
  if (!model.available) {
    return null;
  }
  return (
    <AccountEmailsView
      shouldAllowCreation={model.shouldAllowCreation}
      shouldAllowDeletion={model.shouldAllowDeletion}
    />
  );
}

export function AccountPhone(): ReactNode {
  const model = useAccountPhoneModel();
  if (!model.available) {
    return null;
  }
  return (
    <AccountPhoneView
      shouldAllowCreation={model.shouldAllowCreation}
      shouldAllowDeletion={model.shouldAllowDeletion}
    />
  );
}

export function AccountConnectedAccounts(): ReactNode {
  const model = useAccountConnectedAccountsModel();
  if (!model.available) {
    return null;
  }
  return <AccountConnectedAccountsView shouldAllowCreation={model.shouldAllowCreation} />;
}

export function AccountEnterpriseAccounts(): ReactNode {
  const model = useAccountEnterpriseAccountsModel();
  if (!model.available) {
    return null;
  }
  return <AccountEnterpriseAccountsView />;
}

export function AccountWeb3(): ReactNode {
  const model = useAccountWeb3Model();
  if (!model.available) {
    return null;
  }
  return <AccountWeb3View shouldAllowCreation={model.shouldAllowCreation} />;
}
