import { useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';

import type { OrganizationListFlowController } from './organization-list.types';

export const useOrganizationListFlowController = (showListInitially: boolean): OrganizationListFlowController => {
  const card = useCardState();
  const [isCreateOrganizationFlow, setIsCreateOrganizationFlow] = useState(!showListInitially);

  return {
    error: card.error,
    isCreateOrganizationFlow,
    onCreateOrganizationClick: () => {
      card.setError(undefined);
      setIsCreateOrganizationFlow(true);
    },
    onCreateOrganizationComplete: () => setIsCreateOrganizationFlow(false),
    onCancel: showListInitially && isCreateOrganizationFlow ? () => setIsCreateOrganizationFlow(false) : undefined,
  };
};
