import React from 'react';

import { withCoreUserGuard } from '../../contexts';
import { Flex, Flow } from '../../customizables';
import { withCardStateProvider } from '../../elements';
// import {Portal} from '../../elements/Portal';
import { usePopover } from '../../hooks';
// import {getFullName, getIdentifier} from '../../utils';

const _OrganizationSwitcher = () => {
  // const { defaultOpen } = useUserButtonContext();
  const { floating, reference, styles, toggle, isOpen } = usePopover({
    placement: 'bottom-end',
    offset: 8,
  });

  return (
    <Flow.Root flow='organizationSwitcher'>
      <Flex
        // elementDescriptor={descriptors.userButtonBox}
        isOpen={isOpen}
        align='center'
        gap={2}
      >
        {/*<UserButtonTopLevelIdentifier />*/}
        {/*<button*/}
        {/*  ref={reference}*/}
        {/*  onClick={toggle}>*/}
        {/*  // isOpen={isOpen}>*/}
        {/*  open me*/}
        {/*</button>*/}
        {/*<Portal>*/}
        {/*  <div*/}
        {/*    isOpen={isOpen}*/}
        {/*    close={toggle}*/}
        {/*    ref={floating}*/}
        {/*    style={{ ...styles }}>*/}
        {/*    hello*/}
        {/*  </div>*/}
        {/*</Portal>*/}
      </Flex>
    </Flow.Root>
  );
};

export const OrganizationSwitcher = withCoreUserGuard(withCardStateProvider(_OrganizationSwitcher));
