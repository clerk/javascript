import React from 'react';
import { Route } from 'ui/router';
import { VerifyMagicLink } from 'ui/common';

export const VerifyMagicLinkRoutes = (): JSX.Element => {
  return (
    <Route path='verify'>
      <VerifyMagicLink successHeader='Successfully verified email' />
    </Route>
  );
};
