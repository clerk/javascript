import type { ComponentProps } from 'react';

import { Col, descriptors } from '../../customizables';
import type { InternalTheme } from '../../styledSystem';

type ActionCardProps = ComponentProps<typeof Col> & {
  variant?: 'neutral' | 'destructive';
};

const styles = (t: InternalTheme) => ({
  neutral: {
    backgroundColor: t.colors.$colorBackground,
  },
  destructive: {
    backgroundColor: t.colors.$neutralAlpha50,
  },
});

export const ActionCard = (props: ActionCardProps) => {
  const { children, sx, variant = 'neutral', ...rest } = props;

  return (
    <Col
      elementDescriptor={descriptors.actionCard}
      sx={[
        t => ({
          gap: t.space.$4,
          borderRadius: t.radii.$lg,
          padding: `${t.space.$4} ${t.space.$5}`,
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$borderAlpha150,
          ...styles(t)[variant],
        }),
        sx,
      ]}
      {...rest}
    >
      {children}
    </Col>
  );
};
