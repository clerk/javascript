import { useCardState } from '../../elements/contexts';
import type { useAlternativeMethodsModel } from './alternative-methods.model';
import type { AlternativeMethodListProps } from './AlternativeMethods';

type AlternativeMethodsModel = ReturnType<typeof useAlternativeMethodsModel>;

export function useAlternativeMethodsController(model: AlternativeMethodsModel, props: AlternativeMethodListProps) {
  const card = useCardState();
  const selectFactor: AlternativeMethodListProps['onFactorSelected'] = factor => {
    card.setError(undefined);
    props.onFactorSelected(factor);
  };

  return {
    mode: props.mode ?? 'default',
    onBackLinkClick: props.onBackLinkClick,
    onHavingTroubleClick: props.onHavingTroubleClick,
    resetPasswordFactor: model.resetPasswordFactor,
    firstPartyFactors: model.firstPartyFactors,
    hasAnyStrategy: model.hasAnyStrategy,
    error: card.error,
    isLoading: card.isLoading,
    selectFactor,
  };
}
