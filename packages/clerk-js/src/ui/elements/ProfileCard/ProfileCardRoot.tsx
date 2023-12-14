import React from 'react';

import type { PropsOfComponent } from '../../styledSystem';
import { mqu } from '../../styledSystem';
import { Card } from '../Card';

export const ProfileCardRoot = React.forwardRef<HTMLDivElement, PropsOfComponent<typeof Card.Root>>((props, ref) => {
  const { sx, children, ...rest } = props;
  return (
    <Card.Root
      ref={ref}
      sx={[
        t => ({
          width: t.sizes.$220,
          maxWidth: `calc(100vw - ${t.sizes.$20})`,
          display: 'grid',
          gridTemplateColumns: '1fr 2.5fr',
          [mqu.md]: {
            display: 'block',
          },
          height: t.sizes.$176,
          overflow: 'hidden',
        }),
        sx,
      ]}
      {...rest}
    >
      {children}
    </Card.Root>
  );
});
