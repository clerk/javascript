import { forwardRef } from 'react';

import { useCoreUser } from '../../contexts';
import { Button, descriptors } from '../../customizables';
import { UserAvatar, withAvatarShimmer } from '../../elements';
import type { PropsOfComponent } from '../../styledSystem';

type UserButtonTriggerProps = PropsOfComponent<typeof Button> & {
  isOpen: boolean;
};

export const UserButtonTrigger = withAvatarShimmer(
  forwardRef<HTMLButtonElement, UserButtonTriggerProps>((props, ref) => {
    const { sx, ...rest } = props;
    const user = useCoreUser();

    return (
      <Button
        elementDescriptor={descriptors.userButtonTrigger}
        variant='roundWrapper'
        sx={[theme => ({ borderRadius: theme.radii.$circle }), sx]}
        ref={ref}
        {...rest}
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
  }),
);
