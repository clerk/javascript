import { CustomPageContentContainer } from '../../common/CustomPageContentContainer';
import { useUserProfileContext } from '../../contexts';
import { ProfileCardContent } from '../../elements';
import { Route, Switch } from '../../router';
import type { PropsOfComponent } from '../../styledSystem';
import { ConnectedAccountsPage } from './ConnectedAccountsPage';
import { DeletePage } from './DeletePage';
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
  const { pages } = useUserProfileContext();
  const isAccountPageRoot = pages.routes[0].id === 'account' || pages.routes[0].id === 'security';
  return (
    <ProfileCardContent contentRef={props.contentRef}>
      <Switch>
        {/* Custom Pages */}
        {pages.contents?.map((customPage, index) => (
          <Route
            index={!isAccountPageRoot && index === 0}
            path={!isAccountPageRoot && index === 0 ? undefined : customPage.url}
            key={`custom-page-${customPage.url}`}
          >
            <CustomPageContentContainer
              mount={customPage.mount}
              unmount={customPage.unmount}
            />
          </Route>
        ))}
        <Route path={isAccountPageRoot ? undefined : 'account'}>
          <Route
            path='profile'
            flowStart
          >
            <ProfilePage />
          </Route>
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
          {/*<Route path='security'>*/}
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
            <RootPage />
          </Route>
        </Route>
      </Switch>
    </ProfileCardContent>
  );
};
