import { useUser } from '@clerk/shared/react';
import { useId } from 'react';

import { getFullName, getIdentifier } from '../../../utils/user';
import { useUserButtonContext, withCoreUserGuard } from '../../contexts';
import { descriptors, Flex, Flow, Text } from '../../customizables';
import { Popover, withCardStateProvider, withFloatingTree } from '../../elements';
import { usePopover } from '../../hooks';
import { UserButtonPopover } from './UserButtonPopover';
import { UserButtonTrigger } from './UserButtonTrigger';

const _UserButton = withFloatingTree(() => {
  const { defaultOpen } = useUserButtonContext();
  const { floating, reference, styles, toggle, isOpen, nodeId, context } = usePopover({
    defaultOpen,
    placement: 'bottom-end',
    offset: 8,
  });

  const userButtonMenuId = useId();

  return (
    <Flow.Root flow='userButton'>
      <Flex
        elementDescriptor={descriptors.userButtonBox}
        isOpen={isOpen}
        align='center'
        gap={2}
      >
        <UserButtonTopLevelIdentifier />
        <UserButtonTrigger
          ref={reference}
          onClick={toggle}
          isOpen={isOpen}
          aria-controls={userButtonMenuId}
        />
        <Popover
          nodeId={nodeId}
          context={context}
          isOpen={isOpen}
        >
          <UserButtonPopover
            id={userButtonMenuId}
            close={toggle}
            ref={floating}
            style={{ ...styles }}
          />
        </Popover>
      </Flex>
    </Flow.Root>
  );
});

const UserButtonTopLevelIdentifier = () => {
  const { user } = useUser();

  const { showName } = useUserButtonContext();
  if (!user) {
    return null;
  }
  return showName ? (
    <Text
      variant='subtitle'
      elementDescriptor={descriptors.userButtonOuterIdentifier}
    >
      {getFullName(user) || getIdentifier(user)}
    </Text>
  ) : null;
};

export const UserButton = withCoreUserGuard(withCardStateProvider(_UserButton));
