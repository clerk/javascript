import { type PricingTableCardProps, usePricingTableCardModel } from './pricing-table-card.model';
import { PricingTableCardView } from './pricing-table-card.view';

export const PricingTableCard = (props: PricingTableCardProps) => {
  const model = usePricingTableCardModel(props);
  return model ? <PricingTableCardView {...model} /> : null;
};
