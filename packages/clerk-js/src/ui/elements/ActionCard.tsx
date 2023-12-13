import type { ComponentProps } from 'react';

import { Col, type LocalizationKey, Text } from '../customizables';

type ActionCardProps = ComponentProps<typeof Col> & {
  title: LocalizationKey;
};

export const ActionCard = (props: ActionCardProps) => {
  const { title, children, sx, ...rest } = props;
  return (
    <Col
      sx={[
        t => ({
          gap: t.space.$4,
          boxShadow: t.shadows.$actionCardShadow,
          borderRadius: t.radii.$lg,
          backgroundColor: t.colors.$colorBackground,
        }),
        sx,
      ]}
      {...rest}
    >
      <Text
        localizationKey={title}
        variant='h3'
      />

      {children}
    </Col>
  );
};
