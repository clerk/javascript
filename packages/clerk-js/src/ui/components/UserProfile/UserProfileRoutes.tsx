import { ProfileCardContent } from '../../elements';
import { Route, Switch } from '../../router';
import type { PropsOfComponent } from '../../styledSystem';
import { ConnectedAccountsPage } from './ConnectedAccountsPage';
import { EmailPage } from './EmailPage';
import { MfaBackupCodeCreatePage } from './MfaBackupCodeCreatePage';
import { MfaPage } from './MfaPage';
import { PasswordPage } from './PasswordPage';
import { PhonePage } from './PhonePage';
import { ProfilePage } from './ProfilePage';
import {
  RemoveConnectedAccountPage,
  RemoveEmailPage,
  RemoveMfaPhoneCodePage,
  RemoveMfaTOTPPage,
  RemovePhonePage,
  RemoveWeb3WalletPage,
} from './RemoveResourcePage';
import { RootPage } from './RootPage';
import { UsernamePage } from './UsernamePage';
import { Web3Page } from './Web3Page';

export const UserProfileRoutes = (props: PropsOfComponent<typeof ProfileCardContent>) => {
  return (
    <ProfileCardContent contentRef={props.contentRef}>
      <Route index>
        <RootPage />
      </Route>
      <Route path='profile'>
        <ProfilePage />
      </Route>
      <Route path='email-address'>
        <Switch>
          <Route path=':id/remove'>
            <RemoveEmailPage />
          </Route>
          <Route path=':id'>
            <EmailPage />
          </Route>
          <Route index>
            <EmailPage />
          </Route>
        </Switch>
      </Route>
      <Route path='phone-number'>
        <Switch>
          <Route path=':id/remove'>
            <RemovePhonePage />
          </Route>
          <Route path=':id'>
            <PhonePage />
          </Route>
          <Route index>
            <PhonePage />
          </Route>
        </Switch>
      </Route>
      <Route path='multi-factor'>
        <Switch>
          <Route path='totp/remove'>
            <RemoveMfaTOTPPage />
          </Route>
          <Route path='backup_code/add'>
            <MfaBackupCodeCreatePage />
          </Route>
          <Route path=':id/remove'>
            <RemoveMfaPhoneCodePage />
          </Route>
          <Route path=':id'>
            <MfaPage />
          </Route>
          <Route index>
            <MfaPage />
          </Route>
        </Switch>
      </Route>
      <Route path='connected-account'>
        <Switch>
          <Route path=':id/remove'>
            <RemoveConnectedAccountPage />
          </Route>
          <Route index>
            <ConnectedAccountsPage />
          </Route>
        </Switch>
      </Route>
      <Route path='web3-wallet'>
        <Switch>
          <Route path=':id/remove'>
            <RemoveWeb3WalletPage />
          </Route>
          <Route index>
            <Web3Page />
          </Route>
        </Switch>
      </Route>
      <Route path='username'>
        <UsernamePage />
      </Route>
      {/*<Route path='security'>*/}
      <Route path='password'>
        <PasswordPage />
      </Route>

      {/* TODO: Uncomment these lines once the issue with enabled and required password is resolved */}
      {/*<Route path='remove-password'>*/}
      {/*  <PasswordRemovalPage />*/}
      {/*</Route>*/}

      {/*</Route>*/}
    </ProfileCardContent>
  );
};
