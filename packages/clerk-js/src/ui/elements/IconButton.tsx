import React from 'react';

import { Button, Icon, useLocalizations } from '../customizables';
import { PropsOfComponent } from '../styledSystem';

export const IconButton = (props: PropsOfComponent<typeof Button> & { icon: React.ComponentType }) => {
  const { children, icon, localizationKey, ...rest } = props;
  const { t } = useLocalizations();
  const content = t(localizationKey);

  return (
    <Button {...rest}>
      <Icon
        size='sm'
        icon={icon}
        sx={t => ({ marginRight: t.space.$2 })}
      />
      {content || children}
    </Button>
  );
};
