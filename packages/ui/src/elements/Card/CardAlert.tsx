import React from 'react';

import { animations, type PropsOfComponent } from '../../styledSystem';
import { Alert } from '../Alert';

export const CardAlert = React.memo((props: PropsOfComponent<typeof Alert>) => {
  return (
    <Alert
      variant='danger'
      sx={theme => ({
        animation: `${animations.textInBig} ${theme.transitionDuration.$slow}`,
      })}
      {...props}
    />
  );
});
