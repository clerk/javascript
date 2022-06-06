import React from 'react';
import { Route } from 'ui/router';

import { SocialAccountDetail } from './SocialAccountDetail';
import { SocialAccountList } from './SocialAccountList';

export { SocialAccountList, SocialAccountDetail };

export const SocialAccountsRoutes = (): JSX.Element => {
  return (
    <Route path='social-accounts'>
      <Route index>
        <SocialAccountList />
      </Route>
      <Route path=':social_account_id'>
        <SocialAccountDetail />
      </Route>
    </Route>
  );
};
