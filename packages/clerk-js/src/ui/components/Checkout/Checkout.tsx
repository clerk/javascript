import type { __experimental_CheckoutProps } from '@clerk/types';

import { Flow } from '../../customizables';
import { Drawer } from '../../elements';
import { CheckoutPage } from './CheckoutPage';

export const __experimental_Checkout = (props: __experimental_CheckoutProps) => {
  return (
    <Flow.Root flow='checkout'>
      <Flow.Part>
        <AuthenticatedRoutes {...props} />
      </Flow.Part>
    </Flow.Root>
  );
};

const AuthenticatedRoutes = (props: __experimental_CheckoutProps) => {
  return (
    <>
      <Drawer.Overlay />
      <Drawer.Content>
        <Drawer.Header title='Checkout' />
        <CheckoutPage {...props} />
      </Drawer.Content>
    </>
  );
};
