import { createContextAndHook } from '@clerk/shared/react';
import type {
  BillingPlanResource,
  ChangePlanParams,
  CheckoutSessionResource,
  CreatePortalSessionParams,
  PortalSessionResource,
} from '@clerk/types';
import React from 'react';

type BillingProviderValue = {
  availablePlans: BillingPlanResource[];
  currentPlan: BillingPlanResource;
  createPortalSession: (params: CreatePortalSessionParams) => Promise<PortalSessionResource>;
  changePlan: (params: ChangePlanParams) => Promise<CheckoutSessionResource>;
  currentPage: BillingPages;
  goToPlanAndBilling: () => void;
  goToManageBillingPlan: () => void;
};

type BillingProviderProps = Omit<
  BillingProviderValue,
  'goToPlanAndBilling' | 'goToManageBillingPlan' | 'currentPage'
> & { children: React.ReactNode };

export const [BillingContext, useBillingContext, _] = createContextAndHook<BillingProviderValue>('BillingContext');

type BillingPages = 'planAndBilling' | 'manageBillingPlan';

export const BillingProvider = (params: BillingProviderProps) => {
  const [currentPage, setCurrentPage] = React.useState<BillingPages>('planAndBilling');

  const goToPlanAndBilling = () => {
    setCurrentPage('planAndBilling');
  };

  const goToManageBillingPlan = () => {
    setCurrentPage('manageBillingPlan');
  };

  return (
    <BillingContext.Provider value={{ value: { ...params, currentPage, goToPlanAndBilling, goToManageBillingPlan } }}>
      {params.children}
    </BillingContext.Provider>
  );
};
