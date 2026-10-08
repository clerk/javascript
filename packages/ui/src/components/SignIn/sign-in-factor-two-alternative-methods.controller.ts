import React from 'react';

import { useCardState } from '@/elements/contexts';

import type { useSignInFactorTwoAlternativeMethodsModel } from './sign-in-factor-two-alternative-methods.model';
import type { AlternativeMethodsProps } from './SignInFactorTwoAlternativeMethods';

type Model = ReturnType<typeof useSignInFactorTwoAlternativeMethodsModel>;

export function useSignInFactorTwoAlternativeMethodsController(model: Model, props: AlternativeMethodsProps) {
  const card = useCardState();
  const [showHavingTrouble, setShowHavingTrouble] = React.useState(false);
  const toggleHavingTrouble = React.useCallback(() => setShowHavingTrouble(value => !value), []);

  return {
    showHavingTrouble,
    toggleHavingTrouble,
    supportedSecondFactors: model.supportedSecondFactors,
    error: card.error,
    isLoading: card.isLoading,
    onBackLinkClick: props.onBackLinkClick,
    onFactorSelected: props.onFactorSelected,
  };
}
