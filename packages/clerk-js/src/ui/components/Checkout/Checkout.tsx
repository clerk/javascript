import type { __experimental_CheckoutProps } from '@clerk/types';

import { __experimental_CheckoutContext } from '../../contexts';
import { Flow } from '../../customizables';
import { Drawer } from '../../elements';
import { CheckoutPage } from './CheckoutPage';

export const __experimental_Checkout = (props: __experimental_CheckoutProps) => {
  return (
    <Flow.Root flow='checkout'>
      <Flow.Part>
        <__experimental_CheckoutContext.Provider
          value={{
            componentName: 'Checkout',
            ...props,
          }}
        >
          <Drawer.Content>
            <Drawer.Header title='Checkout' />
            <CheckoutPage {...props} />
          </Drawer.Content>
        </__experimental_CheckoutContext.Provider>
      </Flow.Part>
    </Flow.Root>
  );
};
