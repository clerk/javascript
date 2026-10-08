import type { SessionVerificationSecondFactor } from '@clerk/shared/types';
import type React from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { backupCodePrefFactorComparator } from '@/ui/utils/factorSorting';

import { useHavingTroubleController } from './having-trouble.controller';
import { HavingTrouble } from './HavingTrouble';
import { UVFactorTwoAlternativeMethodsView } from './uv-factor-two-alternative-methods.view';

export type AlternativeMethodsProps = {
  onBackLinkClick: React.MouseEventHandler | undefined;
  onFactorSelected: (factor: SessionVerificationSecondFactor) => void;
  supportedSecondFactors: SessionVerificationSecondFactor[] | null;
};

export const UVFactorTwoAlternativeMethods = (props: AlternativeMethodsProps) => {
  const help = useHavingTroubleController();
  if (help.showHavingTrouble) {
    return <HavingTrouble onBackLinkClick={help.toggleHavingTrouble} />;
  }
  return (
    <AlternativeMethodsList
      {...props}
      onHavingTroubleClick={help.toggleHavingTrouble}
    />
  );
};

const AlternativeMethodsList = (props: AlternativeMethodsProps & { onHavingTroubleClick: React.MouseEventHandler }) => {
  const { error, isLoading } = useCardState();
  const factors = props.supportedSecondFactors
    ? [...props.supportedSecondFactors].sort(backupCodePrefFactorComparator)
    : null;
  return (
    <UVFactorTwoAlternativeMethodsView
      supportedSecondFactors={factors}
      error={error}
      isLoading={isLoading}
      selectFactor={props.onFactorSelected}
      onBackLinkClick={props.onBackLinkClick}
      onHavingTroubleClick={props.onHavingTroubleClick}
    />
  );
};

export { getButtonLabel } from './uv-factor-two-alternative-methods.view';
