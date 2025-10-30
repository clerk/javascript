import type { GoogleOneTapProps } from '@clerk/shared/types';
import React from 'react';

import { withCoreSessionSwitchGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Route, Switch } from '../../router';
import { OneTapStart } from './one-tap-start';

function OneTapRoutes(): JSX.Element {
  return (
    <Route path='one-tap'>
      <Flow.Root flow='oneTap'>
        <Switch>
          <Route index>
            <OneTapStart />
          </Route>
        </Switch>
      </Flow.Root>
    </Route>
  );
}

OneTapRoutes.displayName = 'OneTap';

export const OneTap: React.ComponentType<GoogleOneTapProps> = withCoreSessionSwitchGuard(OneTapRoutes);
