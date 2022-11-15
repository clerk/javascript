import { withOrganizationsEnabledGuard } from '../../common';
import { withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
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
    </Flow.Root>
  );
};

export const OrganizationSwitcher = withOrganizationsEnabledGuard(
  withCoreUserGuard(withCardStateProvider(_OrganizationSwitcher)),
  'OrganizationSwitcher',
  { mode: 'hide' },
);
