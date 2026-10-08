import type { VerificationStrategy } from '@clerk/shared/types';
import { useReducer, useState } from 'react';

import { localizationKeys } from '@/ui/customizables';
import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { useCardState } from '@/ui/elements/contexts';
import type { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import type { PropsOfComponent } from '@/ui/styledSystem';
import { handleError } from '@/ui/utils/errorHandler';

import type { useMfaPhoneCodeModel } from './mfa-section.model';

type MenuActions = PropsOfComponent<typeof ThreeDotsMenu>['actions'];

export const useMfaSectionController = () => {
  const [actionValue, setActionValue] = useState<string | null>(null);

  return { actionValue, setActionValue, closeAction: () => setActionValue(null) };
};

export const useMfaPhoneCodeController = (model: ReturnType<typeof useMfaPhoneCodeModel>) => {
  const { open } = useActionContext();
  const card = useCardState();

  const actions = (
    [
      model.showSetDefaultAction
        ? {
            label: localizationKeys('userProfile.start.mfaSection.phoneCode.actionLabel__setDefault'),
            onClick: () => model.makeDefaultSecondFactor().catch(error => handleError(error, [], card.setError)),
          }
        : null,
      !model.hidePhoneCodeDeleteAction
        ? {
            label: localizationKeys('userProfile.start.mfaSection.phoneCode.destructiveActionLabel'),
            isDestructive: true,
            onClick: () => open(`remove-${model.id}`),
          }
        : null,
    ] satisfies (MenuActions[0] | null)[]
  ).filter(action => action !== null) as MenuActions;

  return { id: model.id, phoneNumber: model.phoneNumber, isDefault: model.isDefault, actions };
};

export const useMfaMenuController = (
  action: string,
  label: Parameters<typeof localizationKeys>[0],
  isDestructive = false,
) => {
  const { open } = useActionContext();

  const actions = (
    [
      {
        label: localizationKeys(label),
        ...(isDestructive ? { isDestructive: true } : {}),
        onClick: () => open(action),
      },
    ] satisfies (MenuActions[0] | null)[]
  ).filter(item => item !== null) as MenuActions;

  return { actions };
};

type AddMenuState = { status: 'idle' } | { status: 'selected'; strategy: VerificationStrategy };
type AddMenuEvent = { type: 'select'; strategy: VerificationStrategy };

const addMenuTransition = (_state: AddMenuState, event: AddMenuEvent): AddMenuState => ({
  status: 'selected',
  strategy: event.strategy,
});

export const useMfaAddMenuController = () => {
  const { open } = useActionContext();
  const [state, dispatch] = useReducer(addMenuTransition, { status: 'idle' });

  return {
    selectedStrategy: state.status === 'selected' ? state.strategy : undefined,
    selectStrategy: (strategy: VerificationStrategy) => {
      dispatch({ type: 'select', strategy });
      open('multi-factor');
    },
  };
};
