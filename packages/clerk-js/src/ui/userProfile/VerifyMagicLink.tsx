import React from 'react';
import { VerifyMagicLink } from 'ui/common';
import { Route } from 'ui/router';

export const VerifyMagicLinkRoutes = (): JSX.Element => {
  return (
    <Route path='verify'>
      <VerifyMagicLink successHeader='Successfully verified email' />
    </Route>
  );
};
