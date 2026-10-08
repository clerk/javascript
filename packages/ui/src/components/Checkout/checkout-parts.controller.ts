import { useDrawerContext } from '@/ui/elements/Drawer';

import type { useCheckoutAddEmailModel } from './checkout-parts.model';

export const useCheckoutAddEmailController = (model: ReturnType<typeof useCheckoutAddEmailModel>) => {
  const { setIsOpen } = useDrawerContext();
  return {
    onSuccess: model.restartCheckout,
    onReset: () => setIsOpen(false),
  };
};
