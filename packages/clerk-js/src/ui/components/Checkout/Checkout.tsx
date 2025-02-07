import type { CheckoutProps } from '@clerk/types';
import { useEffect, useState } from 'react';

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
  const { show = false } = useCheckoutContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (show) {
      setMounted(true);
      return;
    } else {
      const timer = setTimeout(() => {
        setMounted(false);
      }, 280);
      return () => clearTimeout(timer);
    }
  }, [show, mounted]);

  if (!mounted && !show) {
    return null;
  }

  return <CheckoutPage {...props} />;
});
