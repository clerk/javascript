import type { SignInFactor } from '@clerk/shared/types';
import type React from 'react';

import { useAlternativeMethodsController } from './alternative-methods.controller';
import { useAlternativeMethodsModel } from './alternative-methods.model';
import { AlternativeMethodsView } from './alternative-methods.view';
import { useHavingTroubleController } from './having-trouble.controller';
import { HavingTrouble } from './HavingTrouble';

export type AlternativeMethodsProps = {
  onBackLinkClick: React.MouseEventHandler | undefined;
  onFactorSelected: (factor: SignInFactor) => void;
  currentFactor: SignInFactor | undefined | null;
};

export type AlternativeMethodListProps = AlternativeMethodsProps & { onHavingTroubleClick: React.MouseEventHandler };

export const AlternativeMethods = (props: AlternativeMethodsProps) => {
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

const AlternativeMethodsList = (props: AlternativeMethodListProps) => {
  const model = useAlternativeMethodsModel(props.currentFactor);
  const controller = useAlternativeMethodsController(props.onFactorSelected);
  return (
    <AlternativeMethodsView
      {...model}
      {...controller}
      onBackLinkClick={props.onBackLinkClick}
      onHavingTroubleClick={props.onHavingTroubleClick}
    />
  );
};

export { getButtonIcon, getButtonLabel } from './alternative-methods.view';
