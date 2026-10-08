import { ConnectedAccountsSection } from './ConnectedAccountsSection';
import { EmailsSection } from './EmailsSection';
import { EnterpriseAccountsSection } from './EnterpriseAccountsSection';
import { PhoneSection } from './PhoneSection';
import { UsernameSection } from './UsernameSection';
import { Web3Section } from './Web3Section';

export const AccountUsernameView = ({ isImmutable }: { isImmutable: boolean }) => (
  <UsernameSection isImmutable={isImmutable} />
);

export const AccountEmailsView = (props: { shouldAllowCreation: boolean; shouldAllowDeletion: boolean }) => (
  <EmailsSection {...props} />
);

export const AccountPhoneView = (props: { shouldAllowCreation: boolean; shouldAllowDeletion: boolean }) => (
  <PhoneSection {...props} />
);

export const AccountConnectedAccountsView = ({ shouldAllowCreation }: { shouldAllowCreation: boolean }) => (
  <ConnectedAccountsSection shouldAllowCreation={shouldAllowCreation} />
);

export const AccountEnterpriseAccountsView = () => <EnterpriseAccountsSection />;

export const AccountWeb3View = ({ shouldAllowCreation }: { shouldAllowCreation: boolean }) => (
  <Web3Section shouldAllowCreation={shouldAllowCreation} />
);
