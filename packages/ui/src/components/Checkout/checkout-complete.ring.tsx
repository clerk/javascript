import { useCheckoutSuccessRingController } from './checkout-complete.controller';
import { CheckoutSuccessRingView } from './checkout-complete-ring.view';

export const CheckoutSuccessRing = ({ positionX, positionY }: { positionX: number; positionY: number }) => {
  const controller = useCheckoutSuccessRingController(positionX, positionY);
  return <CheckoutSuccessRingView controller={controller} />;
};
