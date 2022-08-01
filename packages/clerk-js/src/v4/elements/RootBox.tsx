import React from 'react';

import { Col } from '../customizables';
import { PropsOfComponent } from '../styledSystem';

export const RootBox = (props: PropsOfComponent<typeof Col>) => {
  return (
    <Col
      {...props}
      sx={t => ({
        boxSizing: 'border-box',
        width: 'fit-content',

        fontFamily: t.fonts.$main,
        fontStyle: t.fontStyles.$normal,
      })}
    />
  );
};
