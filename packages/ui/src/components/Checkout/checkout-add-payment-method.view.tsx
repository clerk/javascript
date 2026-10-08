import { DevOnly } from '../../common/DevOnly';
import * as AddPaymentMethod from '../PaymentMethods/AddPaymentMethod';
import type { AddPaymentMethodForCheckoutModel } from './checkout-mutations.types';
import { PayWithTestPaymentMethod } from './checkout-pay-with-test';

export const AddPaymentMethodForCheckoutView = ({
  submitLabel,
}: {
  submitLabel: AddPaymentMethodForCheckoutModel['submitLabel'];
}) => (
  <>
    <DevOnly>
      <PayWithTestPaymentMethod />
    </DevOnly>
    <AddPaymentMethod.FormButton text={submitLabel} />
  </>
);
