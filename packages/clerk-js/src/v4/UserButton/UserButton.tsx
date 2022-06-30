import React from 'react';

import { useCoreUser, useUserButtonContext, withCoreUserGuard } from '../../ui/contexts';
import { descriptors, Flex, Flow, Text } from '../customizables';
import { withCardStateProvider } from '../elements';
import { usePopover } from '../hooks';
import { getFullName, getIdentifier } from '../utils';
import { Portal } from './Portal';
import { UserButtonPopover } from './UserButtonPopover';
import { UserButtonTrigger } from './UserButtonTrigger';

const _UserButton = () => {
  const { floating, reference, styles, toggle, isOpen } = usePopover({
    defaultOpen: false,
    placement: 'bottom-end',
    offset: 8,
  });

  return (
    <Flow.Root flow='userButton'>
      <Flex
        elementDescriptor={descriptors.userButton}
        isOpen={isOpen}
        align='center'
        gap={2}
      >
        <UserButtonTopLevelIdentifier />
        <UserButtonTrigger
          ref={reference}
          onClick={toggle}
          isOpen={isOpen}
        />
        <Portal>
          <UserButtonPopover
            isOpen={isOpen}
            close={toggle}
            ref={floating}
            style={{ ...styles }}
          />
        </Portal>
      </Flex>
    </Flow.Root>
  );
};

const UserButtonTopLevelIdentifier = () => {
  const user = useCoreUser();
  const { showName } = useUserButtonContext();
  return showName ? <Text variant='regularMedium'>{getFullName(user) || getIdentifier(user)}</Text> : null;
};

export const UserButton = withCoreUserGuard(withCardStateProvider(_UserButton));
