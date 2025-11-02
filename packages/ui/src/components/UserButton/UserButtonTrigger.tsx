import { useUser } from '@clerk/shared/react';
import { forwardRef } from 'react';

import { UserAvatar } from '@/ui/elements/UserAvatar';
import { withAvatarShimmer } from '@/ui/elements/withAvatarShimmer';

import { useUserButtonContext } from '../../contexts';
import { Button, descriptors, Flex, localizationKeys, useLocalizations } from '../../customizables';
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
    const { t } = useLocalizations();

    return (
      <Button
        elementDescriptor={descriptors.userButtonTrigger}
        variant='roundWrapper'
        sx={[t => ({ borderRadius: showName ? t.radii.$md : t.radii.$circle, color: t.colors.$colorForeground }), sx]}
        ref={ref}
        aria-label={`${props.isOpen ? t(localizationKeys('userButton.action__closeUserMenu')) : t(localizationKeys('userButton.action__openUserMenu'))}`}
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
