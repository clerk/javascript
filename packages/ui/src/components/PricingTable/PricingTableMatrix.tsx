import { type PricingTableMatrixProps, usePricingTableMatrixModel } from './pricing-table-matrix.model';
import { PricingTableMatrixView } from './pricing-table-matrix.view';

export function PricingTableMatrix(props: PricingTableMatrixProps) {
  const model = usePricingTableMatrixModel(props);
  return <PricingTableMatrixView {...model} />;
}
