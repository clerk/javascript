import type { PricingTableProps } from '@clerk/shared/types';

import { usePricingTableContext } from '../../contexts';
import { usePricingTableController } from './pricing-table.controller';
import { usePricingTableModel } from './pricing-table.model';
import type { PricingTableModel } from './pricing-table.types';
import { PricingTableView } from './pricing-table.view';
import { PricingTableDefault } from './PricingTableDefault';
import { PricingTableMatrix } from './PricingTableMatrix';

const PricingTableRoot = (props: PricingTableProps) => {
  const model = usePricingTableModel(props);
  return (
    <PricingTableContent
      key={model.scopeKey}
      model={model}
      props={props}
    />
  );
};

const PricingTableContent = ({ model, props }: { model: PricingTableModel; props: PricingTableProps }) => {
  const controller = usePricingTableController(model);
  return (
    <PricingTableView
      {...controller}
      matrix={
        <PricingTableMatrix
          planIds={model.planIds}
          planPeriod={controller.planPeriod}
          setPlanPeriod={controller.setPlanPeriod}
          onSelect={controller.selectPlan}
          highlightedPlan={controller.highlightedPlan}
        />
      }
      cards={
        <PricingTableDefault
          planIds={model.planIds}
          highlightedPlan={controller.highlightedPlan}
          planPeriod={controller.planPeriod}
          setPlanPeriod={controller.setPlanPeriod}
          onSelect={controller.selectPlan}
          onShowDetails={controller.showPlanDetails}
          isCompact={controller.isCompact}
          props={props}
        />
      }
    />
  );
};

// When used in a modal, we need to wrap the root in a div to avoid layout issues
// within UserProfile and OrganizationProfile.
const PricingTableModal = (props: PricingTableProps) => {
  return (
    // TODO: Used by InvisibleRootBox, can we simplify?
    <div>
      <PricingTableRoot {...props} />
    </div>
  );
};

export const PricingTable = (props: PricingTableProps) => {
  const { mode = 'mounted' } = usePricingTableContext();

  return mode === 'modal' ? <PricingTableModal {...props} /> : <PricingTableRoot {...props} />;
};
