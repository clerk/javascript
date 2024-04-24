import { useUser } from '@clerk/shared/react';
import { forwardRef } from 'react';

import { useUserButtonContext } from '../../contexts';
import { Button, descriptors, Flex } from '../../customizables';
import { UserAvatar, withAvatarShimmer } from '../../elements';
import type { PropsOfComponent } from '../../styledSystem';
import { UserButtonTopLevelIdentifier } from './UserButtonTopLevelIdentifier';

type UserButtonTriggerProps = PropsOfComponent<typeof Button> & {
  isOpen: boolean;
};

export const UserButtonTrigger = withAvatarShimmer(
  forwardRef<HTMLButtonElement, UserButtonTriggerProps>((props, ref) => {
    const { sx, ...rest } = props;
    const { user } = useUser();
    const { showName } = useUserButtonContext();

    return (
      <Button
        elementDescriptor={descriptors.userButtonTrigger}
        variant='roundWrapper'
        sx={[t => ({ borderRadius: showName ? t.radii.$md : t.radii.$circle, color: t.colors.$colorText }), sx]}
        ref={ref}
        aria-label={`${props.isOpen ? 'Close' : 'Open'} user button`}
        aria-expanded={props.isOpen}
        aria-haspopup='dialog'
        {...rest}
      >
        <Flex
          elementDescriptor={descriptors.userButtonBox}
          isOpen={props.isOpen}
          align='center'
          as='span'
          gap={2}
        >
          <UserButtonTopLevelIdentifier showName={showName} />
          <UserAvatar
            boxElementDescriptor={descriptors.userButtonAvatarBox}
            imageElementDescriptor={descriptors.userButtonAvatarImage}
            {...user}
            size={theme => theme.sizes.$7}
          />
        </Flex>
      </Button>
    );
  }),
);
