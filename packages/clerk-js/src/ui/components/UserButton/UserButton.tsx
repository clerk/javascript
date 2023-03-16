import { getFullName, getIdentifier } from '../../../utils/user';
import { useCoreUser, useUserButtonContext, withCoreUserGuard } from '../../contexts';
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
        />
        <Popover
          nodeId={nodeId}
          context={context}
          isOpen={isOpen}
        >
          <UserButtonPopover
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
  const user = useCoreUser();
  const { showName } = useUserButtonContext();
  return showName ? (
    <Text
      variant='regularMedium'
      elementDescriptor={descriptors.userButtonOuterIdentifier}
    >
      {getFullName(user) || getIdentifier(user)}
    </Text>
  ) : null;
};

export const UserButton = withCoreUserGuard(withCardStateProvider(_UserButton));
