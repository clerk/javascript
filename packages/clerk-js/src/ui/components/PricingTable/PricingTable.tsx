import { usePricingTableContext } from '../../contexts';

export const PricingTable = () => {
  const { currency } = usePricingTableContext();
  return <h1>Pricing Table {currency}</h1>;
};
