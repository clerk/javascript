import React from 'react';

import { Button, Icon } from '../customizables';
import { PropsOfComponent } from '../styledSystem';

export const IconButton = (props: PropsOfComponent<typeof Button> & { icon: React.ComponentType }) => {
  const { children, icon, ...rest } = props;
  return (
    <Button {...rest}>
      <Icon
        size='sm'
        icon={icon}
        sx={t => ({ marginRight: t.space.$2 })}
      />
      {children}
    </Button>
  );
};
