import type { __experimental_CheckoutProps } from '@clerk/types';

import { __experimental_CheckoutContext, SubscriberTypeContext } from '../../contexts';
import { Flow } from '../../customizables';
import { Drawer } from '../../elements';
import { CheckoutPage } from './CheckoutPage';

export const __experimental_Checkout = (props: __experimental_CheckoutProps) => {
  return (
    <Flow.Root flow='checkout'>
      <Flow.Part>
        <SubscriberTypeContext.Provider value={props.subscriberType || 'user'}>
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
        </SubscriberTypeContext.Provider>
      </Flow.Part>
    </Flow.Root>
  );
};
