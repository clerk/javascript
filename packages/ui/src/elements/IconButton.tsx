import { cloneElement, isValidElement } from 'react';

import { Button, Icon, useLocalizations } from '../customizables';
import type { ElementDescriptor } from '../customizables/elementDescriptors';
import type { PropsOfComponent } from '../styledSystem';

export const IconButton = (
  props: PropsOfComponent<typeof Button> & {
    icon: React.ReactElement | React.ComponentType;
    'aria-label': string;
    iconElementDescriptor?: ElementDescriptor;
  },
) => {
  const { children, icon, localizationKey, iconElementDescriptor, ...rest } = props;
  const { t } = useLocalizations();
  const content = t(localizationKey);

  const _icon = isValidElement(icon) ? (
    cloneElement(icon as any, { 'aria-hidden': true, focusable: false })
  ) : (
    <Icon
      elementDescriptor={iconElementDescriptor}
      icon={icon as React.ComponentType}
      size='md'
    />
  );

  return (
    <Button {...rest}>
      <>
        {_icon}
        {content || children}
      </>
    </Button>
  );
};
