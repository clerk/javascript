import type { __experimental_CheckoutProps } from '@clerk/types';

import { useCheckoutContext, withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Drawer } from '../../elements';
import { Route, Switch } from '../../router';
import { CheckoutContent } from './CheckoutContent';

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
  const { mode = 'mounted', open = false, setIsOpen } = useCheckoutContext();

  return (
    <Drawer.Root
      open={open}
      onOpenChange={setIsOpen}
      strategy={mode === 'mounted' ? 'fixed' : 'absolute'}
      portalProps={{
        id: mode === 'modal' ? 'profileCardScrollBox' : undefined,
      }}
    >
      <Drawer.Overlay />
      <Drawer.Content>
        <Drawer.Header title='Checkout' />
        <Drawer.Body>
          <CheckoutContent {...props} />
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
});
