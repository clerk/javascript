import type { ComponentProps } from 'react';

import { Col } from '../../customizables';

type ActionCardProps = ComponentProps<typeof Col>;
export const ActionCard = (props: ActionCardProps) => {
  const { children, sx, ...rest } = props;
  return (
    <Col
      sx={[
        t => ({
          gap: t.space.$4,
          boxShadow: t.shadows.$actionCardShadow,
          borderRadius: t.radii.$lg,
          backgroundColor: t.colors.$colorBackground,
          padding: t.space.$6,
        }),
        sx,
      ]}
      {...rest}
    >
      {children}
    </Col>
  );
};
