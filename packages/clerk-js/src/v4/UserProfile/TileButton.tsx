import React from 'react';

import { Button, Col, Icon, Text } from '../customizables';
import { PropsOfComponent } from '../styledSystem';

export const TileButton = (props: PropsOfComponent<typeof Button> & { icon: React.ComponentType }) => {
  const { icon, ...rest } = props;

  return (
    <Button
      colorScheme={'neutral'}
      variant={'ghost'}
      sx={[t => ({ height: t.sizes.$24 }), props.sx]}
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
