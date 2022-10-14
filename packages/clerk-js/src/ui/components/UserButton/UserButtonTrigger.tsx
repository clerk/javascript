import React from 'react';

import { useCoreUser } from '../../contexts';
import { Button, descriptors } from '../../customizables';
import { UserAvatar } from '../../elements';
import { PropsOfComponent } from '../../styledSystem';

type UserButtonTriggerProps = PropsOfComponent<typeof Button> & { isOpen: boolean };

export const UserButtonTrigger = React.forwardRef<HTMLButtonElement, UserButtonTriggerProps>((props, ref) => {
  const user = useCoreUser();

  return (
    <Button
      elementDescriptor={descriptors.userButtonTrigger}
      variant='roundWrapper'
      sx={theme => ({ borderRadius: theme.radii.$circle })}
      {...props}
      ref={ref}
    >
      <UserAvatar
        boxElementDescriptor={descriptors.userButtonAvatarBox}
        imageElementDescriptor={descriptors.userButtonAvatarImage}
        {...user}
        optimize
        size={theme => theme.sizes.$8}
      />
    </Button>
  );
});
