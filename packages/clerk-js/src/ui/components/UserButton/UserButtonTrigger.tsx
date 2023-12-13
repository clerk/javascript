import { useUser } from '@clerk/shared/react';
import { forwardRef } from 'react';

import { Button, descriptors } from '../../customizables';
import { UserAvatar, withAvatarShimmer } from '../../elements';
import type { PropsOfComponent } from '../../styledSystem';

type UserButtonTriggerProps = PropsOfComponent<typeof Button> & {
  isOpen: boolean;
};

export const UserButtonTrigger = withAvatarShimmer(
  forwardRef<HTMLButtonElement, UserButtonTriggerProps>((props, ref) => {
    const { sx, ...rest } = props;
    const { user } = useUser();

    return (
      <Button
        elementDescriptor={descriptors.userButtonTrigger}
        variant='roundWrapper'
        sx={[theme => ({ borderRadius: theme.radii.$circle }), sx]}
        ref={ref}
        aria-label={`${props.isOpen ? 'Close' : 'Open'} user button`}
        aria-expanded={props.isOpen}
        aria-haspopup='dialog'
        {...rest}
      >
        <UserAvatar
          boxElementDescriptor={descriptors.userButtonAvatarBox}
          imageElementDescriptor={descriptors.userButtonAvatarImage}
          {...user}
          size={theme => theme.sizes.$7}
        />
      </Button>
    );
  }),
);
