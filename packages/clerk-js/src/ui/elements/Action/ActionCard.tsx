import type { ComponentProps } from 'react';

import { Col } from '../../customizables';

type ActionCardProps = ComponentProps<typeof Col> & {
  variant?: 'neutral' | 'destructive';
};

export const ActionCard = (props: ActionCardProps) => {
  const { children, sx, variant = 'neutral', ...rest } = props;
  return (
    <Col
      sx={[
        t => ({
          gap: t.space.$4,
          boxShadow: variant === 'destructive' ? t.shadows.$actionCardDestructiveShadow : t.shadows.$actionCardShadow,
          borderRadius: t.radii.$lg,
          backgroundColor: variant === 'destructive' ? t.colors.$blackAlpha50 : t.colors.$colorBackground,
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
