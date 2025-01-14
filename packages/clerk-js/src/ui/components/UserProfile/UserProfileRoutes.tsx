import { lazy } from 'react';

import { CustomPageContentContainer } from '../../common/CustomPageContentContainer';
import { USER_PROFILE_NAVBAR_ROUTE_ID } from '../../constants';
import { useUserProfileContext } from '../../contexts';
import { Route, Switch } from '../../router';
import { AccountPage } from './AccountPage';
import { SecurityPage } from './SecurityPage';
const LazyTest = lazy(() =>
  import(/* webpackChunkName: "lalalazyTest" */ './lazy/test').then(m => ({ default: m.LazyTest })),
);

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
      <Route path={'lazy-page'}>
        <LazyTest />
      </Route>
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
      </Route>
    </Switch>
  );
};
