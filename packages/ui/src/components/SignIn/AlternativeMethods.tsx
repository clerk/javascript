import type { SignInFactor } from '@clerk/shared/types';
import type React from 'react';

import { useAlternativeMethodsController } from './alternative-methods.controller';
import { useAlternativeMethodsModel } from './alternative-methods.model';
import { AlternativeMethodsView } from './alternative-methods.view';
import { withHavingTrouble } from './withHavingTrouble';

export { getButtonIcon, getButtonLabel } from './alternative-methods.layout';

export type AlternativeMethodsMode = 'forgot' | 'pwned' | 'passwordCompromised' | 'default';

export type AlternativeMethodsProps = {
  onBackLinkClick: React.MouseEventHandler | undefined;
  onFactorSelected: (factor: SignInFactor) => void;
  currentFactor: SignInFactor | undefined | null;
  mode?: AlternativeMethodsMode;
};

export type AlternativeMethodListProps = AlternativeMethodsProps & { onHavingTroubleClick: React.MouseEventHandler };

export const AlternativeMethods = (props: AlternativeMethodsProps) => {
  return withHavingTrouble(AlternativeMethodsList, { ...props });
};

const AlternativeMethodsList = (props: AlternativeMethodListProps) => {
  const model = useAlternativeMethodsModel(props);
  const controller = useAlternativeMethodsController(model, props);
  return <AlternativeMethodsView {...controller} />;
};
