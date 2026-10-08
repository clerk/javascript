import type { ReactNode } from 'react';

import { Flow } from '../../customizables';
import { Route, Switch } from '../../router';

export function ProtectCheckModalView({ children }: { children: ReactNode }) {
  return (
    <Route path='protect-check'>
      <div>
        <Flow.Root flow='protectCheck'>
          <Switch>
            <Route index>{children}</Route>
          </Switch>
        </Flow.Root>
      </div>
    </Route>
  );
}
