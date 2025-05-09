import type { __internal_CheckoutProps } from '@clerk/types';

import { CheckoutContext, SubscriberTypeContext } from '../../contexts';
import { Flow } from '../../customizables';
import { Drawer } from '../../elements';
import { CheckoutPage } from './CheckoutPage';

export const Checkout = (props: __internal_CheckoutProps) => {
  return (
    <Flow.Root flow='checkout'>
      <Flow.Part>
        <SubscriberTypeContext.Provider value={props.subscriberType || 'user'}>
          <CheckoutContext.Provider
            value={{
              componentName: 'Checkout',
              ...props,
            }}
          >
            <Drawer.Content>
              <Drawer.Header title='Checkout' />
              <CheckoutPage {...props} />
            </Drawer.Content>
          </CheckoutContext.Provider>
        </SubscriberTypeContext.Provider>
      </Flow.Part>
    </Flow.Root>
  );
};
