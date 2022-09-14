import React from 'react';

import { localizationKeys } from '../customizables';
import { ErrorCard } from '../elements';
import { PropsOfComponent } from '../styledSystem';

export const HavingTrouble = (props: PropsOfComponent<typeof ErrorCard>) => {
  const { onBackLinkClick } = props;

  return (
    <ErrorCard
      cardTitle={localizationKeys('signIn.alternativeMethods.getHelp.title')}
      onBackLinkClick={onBackLinkClick}
    />
  );
};
