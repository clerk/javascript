import { useAppliedPromoCodeController, usePromoCodeInputController } from './checkout-promo-code.controller';
import { useAppliedPromoCodeModel, usePromoCodeInputModel } from './checkout-promo-code.model';
import { AppliedPromoCodeView, PromoCodeInputView } from './checkout-promo-code.view';

export const AppliedPromoCodeRow = () => {
  const model = useAppliedPromoCodeModel();
  const controller = useAppliedPromoCodeController(model);
  return <AppliedPromoCodeView controller={controller} />;
};

export const PromoCodeInput = () => {
  const model = usePromoCodeInputModel();
  const controller = usePromoCodeInputController(model);
  return <PromoCodeInputView controller={controller} />;
};
