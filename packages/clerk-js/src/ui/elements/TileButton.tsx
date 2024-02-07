import React from 'react';

import { Button, Col, Icon, Text } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';

export const TileButton = (props: PropsOfComponent<typeof Button> & { icon: React.ComponentType }) => {
  const { icon, ...rest } = props;

  return (
    <Button
      variant='outline'
      sx={[
        t => ({
          borderColor: t.colors.$neutralAlpha200,
        }),
        props.sx,
      ]}
      {...rest}
    >
      <Col
        center
        gap={2}
      >
        <Icon icon={icon} />
        <Text>{props.children}</Text>
      </Col>
    </Button>
  );
};
