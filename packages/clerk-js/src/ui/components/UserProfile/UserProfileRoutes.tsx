import { CustomPageContentContainer } from '../../common/CustomPageContentContainer';
import { USER_PROFILE_NAVBAR_ROUTE_ID } from '../../constants';
import { useUserProfileContext } from '../../contexts';
import { Route, Switch } from '../../router';
import { AccountPage } from './AccountPage';
import { DeletePage } from './DeletePage';
import { MfaBackupCodeCreatePage } from './MfaBackupCodeCreatePage';
import { MfaPage } from './MfaPage';
import { PasswordPage } from './PasswordPage';
import { RemoveMfaPhoneCodePage, RemoveMfaTOTPPage, RemoveWeb3WalletPage } from './RemoveResourcePage';
import { SecurityPage } from './SecurityPage';
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
