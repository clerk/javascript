import type { __experimental_CheckoutProps } from '@clerk/types';

import { PROFILE_CARD_SCROLLBOX_ID } from '../../constants';
import { useCheckoutContext, withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Drawer } from '../../elements';
import { Route, Switch } from '../../router';
import { CheckoutPage } from './CheckoutPage';

export const __experimental_Checkout = (props: __experimental_CheckoutProps) => {
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

const AuthenticatedRoutes = withCoreUserGuard((props: __experimental_CheckoutProps) => {
  const { mode = 'mounted', isOpen = false, setIsOpen = () => {} } = useCheckoutContext();

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      strategy={mode === 'mounted' ? 'fixed' : 'absolute'}
      portalProps={{
        id: mode === 'modal' ? PROFILE_CARD_SCROLLBOX_ID : undefined,
      }}
    >
      <Drawer.Overlay />
      <Drawer.Content>
        <Drawer.Header title='Checkout' />
        <CheckoutPage {...props} />
      </Drawer.Content>
    </Drawer.Root>
  );
});
