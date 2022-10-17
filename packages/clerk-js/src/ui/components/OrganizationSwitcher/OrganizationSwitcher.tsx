import React from 'react';

import { withCoreUserGuard } from '../../contexts';
import { Flex, Flow } from '../../customizables';
import { withCardStateProvider } from '../../elements';
import { Portal } from '../../elements/Portal';
import { usePopover } from '../../hooks';
import { OrganizationSwitcherPopover } from './OrganizationSwitcherPopover';
import { OrganizationSwitcherTrigger } from './OrganizationSwitcherTrigger';

const _OrganizationSwitcher = () => {
  const { floating, reference, styles, toggle, isOpen } = usePopover({
    placement: 'bottom-start',
    offset: 8,
  });

  return (
    <Flow.Root flow='organizationSwitcher'>
      <Flex
        // elementDescriptor={descriptors.organizationSwitcherBox}
        isOpen={isOpen}
        align='center'
        gap={2}
      >
        <OrganizationSwitcherTrigger
          ref={reference}
          onClick={toggle}
          isOpen={isOpen}
        />
        <Portal>
          <OrganizationSwitcherPopover
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

export const OrganizationSwitcher = withCoreUserGuard(withCardStateProvider(_OrganizationSwitcher));
