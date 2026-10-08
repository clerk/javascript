import { useCoreSignIn } from '../../contexts';
import { useAlternativeStrategies } from '../../hooks/useAlternativeStrategies';
import type { AlternativeMethodListProps } from './AlternativeMethods';
import { useResetPasswordFactor } from './useResetPasswordFactor';

export function useAlternativeMethodsModel(props: AlternativeMethodListProps) {
  const resetPasswordFactor = useResetPasswordFactor();
  const { supportedFirstFactors } = useCoreSignIn();
  const { firstPartyFactors, hasAnyStrategy } = useAlternativeStrategies({
    filterOutFactor: props.currentFactor,
    supportedFirstFactors,
  });

  return { resetPasswordFactor, firstPartyFactors, hasAnyStrategy };
}
