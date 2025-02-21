import type { CheckoutProps } from '@clerk/types';

import { CommerceBlade } from '../../common';
import { useCheckoutContext, withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Route, Switch } from '../../router';
import { CheckoutPage } from './CheckoutPage';

export const Checkout = (props: CheckoutProps) => {
  return (
    <Flow.Root flow='checkout'>
      <Flow.Part>
        <Switch>
          <Route>
            <AuthenticatedRoutes {...props} />
          </Route>
        </Switch>
      </Flow.Part>
    </Flow.Root>
  );
};

const AuthenticatedRoutes = withCoreUserGuard((props: CheckoutProps) => {
  const { mode = 'mounted', isShowingBlade = false } = useCheckoutContext();

  return (
    <CommerceBlade
      isOpen={isShowingBlade}
      isFullscreen={mode === 'mounted'}
    >
      <CheckoutPage {...props} />
    </CommerceBlade>
  );
});
