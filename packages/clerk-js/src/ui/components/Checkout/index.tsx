import type { __internal_CheckoutProps } from '@clerk/types';

import { Drawer } from '@/ui/elements/Drawer';

import { CheckoutContext, SubscriberTypeContext } from '../../contexts';
import { Flow, localizationKeys, Spinner } from '../../customizables';
import { CheckoutComplete } from './CheckoutComplete';
import { CheckoutForm } from './CheckoutForm';
import * as CheckoutPage from './CheckoutPage';
import { AddEmailForm, GenericError, InvalidPlanScreen } from './parts';

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
                <CheckoutPage.Stage name='awaiting_initialization'>
                  <CheckoutPage.FetchStatus status='fetching'>
                    <Spinner
                      sx={{
                        margin: 'auto',
                      }}
                    />
                  </CheckoutPage.FetchStatus>

                  <CheckoutPage.FetchStatus status='invalid_plan_change'>
                    <InvalidPlanScreen />
                  </CheckoutPage.FetchStatus>

                  <CheckoutPage.FetchStatus status='missing_payer_email'>
                    <AddEmailForm />
                  </CheckoutPage.FetchStatus>

                  <CheckoutPage.FetchStatus status='error'>
                    <GenericError />
                  </CheckoutPage.FetchStatus>
                </CheckoutPage.Stage>

                <CheckoutPage.Stage name='completed'>
                  <CheckoutComplete />
                </CheckoutPage.Stage>

                <CheckoutPage.Stage name='awaiting_confirmation'>
                  <CheckoutForm />
                </CheckoutPage.Stage>
              </CheckoutPage.Root>
            </Drawer.Content>
          </CheckoutContext.Provider>
        </SubscriberTypeContext.Provider>
      </Flow.Part>
    </Flow.Root>
  );
};
