import type { OneTapModalProps, OneTapProps } from '@clerk/types';
import React from 'react';

import { ComponentContext, withCoreSessionSwitchGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Route, Switch } from '../../router';
import { OneTapStart } from './one-tap-start';
import { OneTapPSU } from './psu';

function OneTapRoutes(): JSX.Element {
  return (
    <Route path='one-tap'>
      <Flow.Root flow='oneTap'>
        <Switch>
          <Route path='psu'>
            <OneTapPSU />
          </Route>
          <Route index>
            <OneTapStart />
          </Route>
        </Switch>
      </Flow.Root>
    </Route>
  );
}

OneTapRoutes.displayName = 'SignIn';

export const OneTap: React.ComponentType<OneTapProps> = withCoreSessionSwitchGuard(OneTapRoutes);

export const OneTapModal = (props: OneTapModalProps): JSX.Element => {
  return (
    <Route path='one-tap'>
      <ComponentContext.Provider
        value={{
          componentName: 'OneTap',
          ...props,
          routing: 'virtual',
        }}
      >
        {/*TODO: Used by InvisibleRootBox, can we simplify? */}
        <div>
          <OneTap
            {...props}
            routing='virtual'
          />
        </div>
      </ComponentContext.Provider>
    </Route>
  );
};
