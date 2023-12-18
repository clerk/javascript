import type { ComponentProps } from 'react';

import { Col } from '../../customizables';

type ActionCardProps = ComponentProps<typeof Col> & {
  isDestructive?: boolean;
};

export const ActionCard = (props: ActionCardProps) => {
  const { children, sx, isDestructive, ...rest } = props;
  return (
    <Col
      sx={[
        t => ({
          gap: t.space.$4,
          boxShadow: isDestructive ? t.shadows.$actionCardDestructiveShadow : t.shadows.$actionCardShadow,
          borderRadius: t.radii.$lg,
          backgroundColor: isDestructive ? t.colors.$blackAlpha50 : t.colors.$colorBackground,
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
