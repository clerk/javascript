import React from 'react';

import { Route, Switch, useRouter } from '../../ui/router';
import { Col, descriptors } from '../customizables';
import { common, mqu } from '../styledSystem';
import { ConnectedAccountsPage } from './ConnectedAccountsPage';
import { EmailPage } from './EmailPage';
import { MfaPage } from './MfaPage';
import { PasswordPage } from './PasswordPage';
import { PhonePage } from './PhonePage';
import { ProfilePage } from './ProfilePage';
import {
  RemoveConnectedAccountPage,
  RemoveEmailPage,
  RemoveMfaPage,
  RemovePhonePage,
  RemoveWeb3WalletPage,
} from './RemoveResourcePage';
import { RootPage } from './RootPage';
import { UsernamePage } from './UsernamePage';
import { Web3Page } from './Web3Page';

export const Content = React.forwardRef<HTMLDivElement>((_, ref) => {
  const router = useRouter();
  const containerRef = ref as React.MutableRefObject<HTMLDivElement>;
  const scrollPosRef = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      if (target.scrollTop) {
        scrollPosRef.current = target.scrollTop;
      }
    };
    containerRef.current?.addEventListener('scroll', handleScroll);
    return () => containerRef.current?.removeEventListener('scroll', handleScroll);
  }, []);

  React.useLayoutEffect(() => {
    if (scrollPosRef.current && containerRef.current) {
      containerRef.current.scrollTop = scrollPosRef.current;
    }
  }, [router.currentPath]);

  return (
    <ScrollerContainer>
      <Col
        elementDescriptor={descriptors.pageSection}
        sx={theme => ({
          flex: `1`,
          padding: `${theme.space.$9x5} ${theme.space.$8}`,
          [mqu.xs]: {
            padding: `${theme.space.$8} ${theme.space.$5}`,
          },
          ...common.maxHeightScroller(theme),
        })}
        ref={ref}
      >
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
            <Route path=':id/remove'>
              <RemoveMfaPage />
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
        {/*</Route>*/}
      </Col>
    </ScrollerContainer>
  );
});

const ScrollerContainer = (props: React.PropsWithChildren<{}>) => {
  return (
    <Col
      elementDescriptor={descriptors.scroller}
      sx={t => ({ position: 'relative', borderRadius: t.radii.$xl, width: '100%', overflow: 'hidden' })}
      {...props}
    />
  );
};
