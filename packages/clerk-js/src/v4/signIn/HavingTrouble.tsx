import React from 'react';

import { ErrorCard, withFlowCardContext } from '../elements';
import { PropsOfComponent } from '../styledSystem';

export const HavingTrouble = withFlowCardContext(
  (props: PropsOfComponent<typeof ErrorCard>) => {
    const { onBackLinkClick } = props;

    return (
      <ErrorCard
        cardTitle="I'm having trouble"
        onBackLinkClick={onBackLinkClick}
      />
    );
  },
  { flow: 'signIn', page: 'havingTrouble' },
);
