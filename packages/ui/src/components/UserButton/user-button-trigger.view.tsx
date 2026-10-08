import { forwardRef } from 'react';

import { UserAvatar } from '@/ui/elements/UserAvatar';
import { withAvatarShimmer } from '@/ui/elements/withAvatarShimmer';

import { Button, descriptors, Flex, Text } from '../../customizables';
import type { PropsOfComponent } from '../../styledSystem';
import type { UserButtonIdentifierData, UserButtonTriggerData } from './user-button.types';

export type UserButtonTriggerProps = PropsOfComponent<typeof Button> & { isOpen: boolean };

export const UserButtonTriggerView = withAvatarShimmer(
  forwardRef<HTMLButtonElement, UserButtonTriggerProps & UserButtonTriggerData>((props, ref) => {
    const { sx, showName, identifier, avatar, ariaLabel, ...rest } = props;

    return (
      <Button
        elementDescriptor={descriptors.userButtonTrigger}
        variant='roundWrapper'
        sx={[t => ({ borderRadius: showName ? t.radii.$md : t.radii.$circle, color: t.colors.$colorForeground }), sx]}
        ref={ref}
        aria-label={ariaLabel}
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
          <UserButtonIdentifierView identifier={identifier} />
          <UserAvatar
            boxElementDescriptor={descriptors.userButtonAvatarBox}
            imageElementDescriptor={descriptors.userButtonAvatarImage}
            {...avatar}
            size={theme => theme.sizes.$7}
          />
        </Flex>
      </Button>
    );
  }),
);

export const UserButtonIdentifierView = ({ identifier }: UserButtonIdentifierData) => {
  if (identifier === undefined) {
    return null;
  }

  return (
    <Text
      variant='subtitle'
      as='span'
      elementDescriptor={descriptors.userButtonOuterIdentifier}
      sx={[t => ({ paddingInlineStart: t.space.$2 })]}
    >
      {identifier}
    </Text>
  );
};
