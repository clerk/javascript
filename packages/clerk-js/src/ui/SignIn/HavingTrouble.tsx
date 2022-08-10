import React from 'react';

import { ErrorCard } from '../elements';
import { PropsOfComponent } from '../styledSystem';

export const HavingTrouble = (props: PropsOfComponent<typeof ErrorCard>) => {
  const { onBackLinkClick } = props;

  return (
    <ErrorCard
      cardTitle='Get help'
      onBackLinkClick={onBackLinkClick}
    />
  );
};
