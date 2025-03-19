import { CustomPageContentContainer } from '../../common/CustomPageContentContainer';
import { USER_PROFILE_NAVBAR_ROUTE_ID } from '../../constants';
import { useOptions, useUserProfileContext } from '../../contexts';
import { Route, Switch } from '../../router';
import { AccountPage } from './AccountPage';
import { BillingPage } from './BillingPage';
import { SecurityPage } from './SecurityPage';

export const UserProfileRoutes = () => {
  const { pages } = useUserProfileContext();
  const { experimental } = useOptions();

  const isAccountPageRoot = pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.ACCOUNT;
  const isSecurityPageRoot = pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.SECURITY;
  const isBillingPageRoot = pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.BILLING;

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
            <Route index>
              <AccountPage />
            </Route>
          </Switch>
        </Route>
        <Route path={isSecurityPageRoot ? undefined : 'security'}>
          <Switch>
            <Route index>
              <SecurityPage />
            </Route>
          </Switch>
        </Route>
        {experimental?.commerce && (
          <Route path={isBillingPageRoot ? undefined : 'billing'}>
            <Switch>
              <Route index>
                <BillingPage />
              </Route>
            </Switch>
          </Route>
        )}
      </Route>
    </Switch>
  );
};
