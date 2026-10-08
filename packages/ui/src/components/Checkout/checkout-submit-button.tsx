import { useCardState } from '@/ui/elements/contexts';

import type { Button } from '../../customizables';
import type { PropsOfComponent } from '../../styledSystem';
import { CheckoutSubmitButtonView } from './checkout-submit-button.view';
import { useCheckoutSubmitLabelModel } from './checkout-submit-label.model';

export const CheckoutSubmitButton = (props: PropsOfComponent<typeof Button>) => {
  const { isLoading } = useCardState();
  const submitLabel = useCheckoutSubmitLabelModel();
  return (
    <CheckoutSubmitButtonView
      isLoading={isLoading}
      submitLabel={submitLabel}
      {...props}
    />
  );
};
