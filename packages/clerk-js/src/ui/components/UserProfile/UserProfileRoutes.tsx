import { CustomPageContentContainer } from '../../common/CustomPageContentContainer';
import { USER_PROFILE_NAVBAR_ROUTE_ID } from '../../constants';
import { useUserProfileContext } from '../../contexts';
import { Route, Switch } from '../../router';
import { AccountPage } from './AccountPage';
import { ConnectedAccountsPage } from './ConnectedAccountsPage';
import { DeletePage } from './DeletePage';
import { EmailPage } from './EmailPage';
import { MfaBackupCodeCreatePage } from './MfaBackupCodeCreatePage';
import { MfaPage } from './MfaPage';
import { PasswordPage } from './PasswordPage';
import { PhonePage } from './PhonePage';
import {
  RemoveConnectedAccountPage,
  RemoveEmailPage,
  RemoveMfaPhoneCodePage,
  RemoveMfaTOTPPage,
  RemovePhonePage,
  RemoveWeb3WalletPage,
} from './RemoveResourcePage';
import { SecurityPage } from './SecurityPage';
import { UsernamePage } from './UsernamePage';
import { Web3Page } from './Web3Page';

export const UserProfileRoutes = () => {
  const { pages } = useUserProfileContext();
  const isAccountPageRoot = pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.ACCOUNT;
  const isSecurityPageRoot = pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.SECURITY;

  const customPageRoutesWithContents = pages.contents?.map((customPage, index) => {
    const shouldFirstCustomItemBeOnRoot = !isAccountPageRoot && !isSecurityPageRoot && index === 0;
    return (
      <Route
        index={shouldFirstCustomItemBeOnRoot}
        path={shouldFirstCustomItemBeOnRoot ? undefined : customPage.url}
        key={`custom-page-${customPage.url}`}
      >
        <CustomPageContentContainer
          mount={customPage.mount}
          unmount={customPage.unmount}
        />
      </Route>
    );
  });

  return (
    <Switch>
      {customPageRoutesWithContents}
      <Route>
        <Route path={isAccountPageRoot ? undefined : 'account'}>
          <Switch>
            <Route
              path='email-address'
              flowStart
            >
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
            <Route
              path='phone-number'
              flowStart
            >
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
            <Route
              path='multi-factor'
              flowStart
            >
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
            <Route
              path='connected-account'
              flowStart
            >
              <Switch>
                <Route path=':id/remove'>
                  <RemoveConnectedAccountPage />
                </Route>
                <Route index>
                  <ConnectedAccountsPage />
                </Route>
              </Switch>
            </Route>
            <Route
              path='web3-wallet'
              flowStart
            >
              <Switch>
                <Route path=':id/remove'>
                  <RemoveWeb3WalletPage />
                </Route>
                <Route index>
                  <Web3Page />
                </Route>
              </Switch>
            </Route>
            <Route
              path='username'
              flowStart
            >
              <UsernamePage />
            </Route>
            <Route index>
              <AccountPage />
            </Route>
          </Switch>
        </Route>
        <Route path={isSecurityPageRoot ? undefined : 'security'}>
          <Switch>
            <Route
              path='password'
              flowStart
            >
              <PasswordPage />
            </Route>
            <Route
              path='delete'
              flowStart
            >
              <DeletePage />
            </Route>
            <Route index>
              <SecurityPage />
            </Route>
          </Switch>
        </Route>
      </Route>
    </Switch>
  );
};
