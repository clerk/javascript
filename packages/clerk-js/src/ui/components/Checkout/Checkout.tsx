import type { __internal_CheckoutProps } from '@clerk/types';

import { CheckoutContext, SubscriberTypeContext } from '../../contexts';
import { Flow, localizationKeys, Spinner } from '../../customizables';
import { Drawer } from '../../elements';
import { CheckoutComplete } from './CheckoutComplete';
import { CheckoutForm } from './CheckoutForm';
import * as CheckoutPage from './CheckoutPage';
import { AddEmailForm, GenericError, InvalidPlanError } from './parts';

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
              <Drawer.Header title={localizationKeys('commerce.checkout.title')} />
              <CheckoutPage.Root>
                <CheckoutPage.PendingCheckout>
                  <Spinner
                    sx={{
                      margin: 'auto',
                    }}
                  />
                </CheckoutPage.PendingCheckout>

                <CheckoutPage.SuccessScreen>
                  <CheckoutComplete />
                </CheckoutPage.SuccessScreen>

                <CheckoutPage.ErrorScreen>
                  <GenericError />
                </CheckoutPage.ErrorScreen>

                <CheckoutPage.InvalidPlanChange>
                  <InvalidPlanError />
                </CheckoutPage.InvalidPlanChange>

                <CheckoutPage.MissingPayerEmail>
                  <AddEmailForm />
                </CheckoutPage.MissingPayerEmail>

                <CheckoutPage.Valid>
                  <CheckoutForm />
                </CheckoutPage.Valid>
              </CheckoutPage.Root>
            </Drawer.Content>
          </CheckoutContext.Provider>
        </SubscriberTypeContext.Provider>
      </Flow.Part>
    </Flow.Root>
  );
};
