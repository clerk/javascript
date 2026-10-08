import { useEffect, useReducer, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import type {
  TaskChooseOrganizationData,
  TaskChooseOrganizationFlow,
  TaskChooseOrganizationFlowController,
  TaskChooseOrganizationViewProps,
} from './task-choose-organization.types';

type AutoActivationState = 'idle' | 'activating' | 'failed';
type AutoActivationEvent = 'activate' | 'fail';

const autoActivationReducer = (state: AutoActivationState, event: AutoActivationEvent): AutoActivationState => {
  if (state === 'idle' && event === 'activate') {
    return 'activating';
  }
  if (state === 'activating' && event === 'fail') {
    return 'failed';
  }
  return state;
};

export const useTaskChooseOrganizationController = (
  model: TaskChooseOrganizationData,
): TaskChooseOrganizationViewProps => {
  const card = useCardState();
  const hasAutoActivated = useRef(false);
  const mounted = useRef(true);
  const latestCard = useRef(card);
  latestCard.current = card;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [autoActivationState, sendAutoActivation] = useReducer(autoActivationReducer, 'idle');
  const shouldAutoActivate = !!model.exclusiveOrganizationId && autoActivationState !== 'failed';
  const { exclusiveOrganizationId, isOrganizationListLoaded, activateExclusiveOrganization } = model;

  // Exclusive members belong to a single org — skip the picker and activate it once the org list is ready.
  // On failure, surface the error and fall back to the normal choose/create flows.
  useEffect(() => {
    if (
      !exclusiveOrganizationId ||
      autoActivationState !== 'idle' ||
      !isOrganizationListLoaded ||
      hasAutoActivated.current
    ) {
      return;
    }

    hasAutoActivated.current = true;
    sendAutoActivation('activate');

    void activateExclusiveOrganization().catch((err: any) => {
      if (!mounted.current) {
        return;
      }
      handleError(err, [], latestCard.current.setError);
      sendAutoActivation('fail');
    });
  }, [exclusiveOrganizationId, autoActivationState, isOrganizationListLoaded, activateExclusiveOrganization, card]);

  return {
    isOrganizationCreationDisabled: model.isOrganizationCreationDisabled && !shouldAutoActivate,
    isLoading: shouldAutoActivate || model.isLoading,
    initialFlow: model.hasExistingResources ? ('choose' as const) : ('create' as const),
    organizationCreationDefaults: model.organizationCreationDefaults,
    identifier: model.identifier,
    signOut: model.signOut,
  };
};

export const useTaskChooseOrganizationFlowsController = (
  initialFlow: TaskChooseOrganizationFlow,
): TaskChooseOrganizationFlowController => {
  const [currentFlow, setCurrentFlow] = useState(initialFlow);
  const card = useCardState();

  return {
    currentFlow,
    onCancel: initialFlow === 'choose' ? () => setCurrentFlow('choose') : undefined,
    onCreateOrganizationClick: () => {
      card.setError(undefined);
      setCurrentFlow('create');
    },
  };
};
