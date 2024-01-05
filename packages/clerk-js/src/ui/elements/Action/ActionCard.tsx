import type { ComponentProps } from 'react';

import { Col } from '../../customizables';
import type { InternalTheme } from '../../styledSystem';
import { common } from '../../styledSystem';

type ActionCardProps = ComponentProps<typeof Col> & {
  variant?: 'neutral' | 'destructive';
};

const styles = (t: InternalTheme) => ({
  neutral: {
    background: t.colors.$colorBackground,
    boxShadow: common.shadows(t).actionCardShadow,
  },
  destructive: {
    background: t.colors.$blackAlpha50,
    boxShadow: common.shadows(t).actionCardDestructiveShadow,
  },
});

export const ActionCard = (props: ActionCardProps) => {
  const { children, sx, variant = 'neutral', ...rest } = props;

  return (
    <Col
      sx={[
        t => ({
          gap: t.space.$4,
          borderRadius: t.radii.$lg,
          padding: t.space.$6,
          backgroundColor: styles(t)[variant].background,
          boxShadow: styles(t)[variant].boxShadow,
        }),
        sx,
      ]}
      {...rest}
    >
      {children}
    </Col>
  );
};
