import type { ReactElement } from 'react';

import { withCardStateProvider, withFloatingTree } from '@/ui/elements/contexts';

import { AcceptedInvitationsProvider, withCoreUserGuard } from '../../contexts';
import { useFloatingMenuController } from '../../hooks/useFloatingMenuController';
import { useOrganizationSwitcherRootModel } from './organization-switcher.model';
import { OrganizationSwitcherFloatingView, OrganizationSwitcherRootView } from './organization-switcher.view';
import { OrganizationSwitcherPopover } from './OrganizationSwitcherPopover';

const OrganizationSwitcherWithFloatingTree = withFloatingTree<{ children: ReactElement; defaultOpen?: boolean }>(
  ({ children, defaultOpen }) => {
    const controller = useFloatingMenuController({ defaultOpen, placement: 'bottom-start' });
    return <OrganizationSwitcherFloatingView {...controller}>{children}</OrganizationSwitcherFloatingView>;
  },
);

const OrganizationSwitcherInternal = () => {
  const model = useOrganizationSwitcherRootModel();

  return (
    <OrganizationSwitcherRootView>
      <AcceptedInvitationsProvider>
        {model.standalone ? (
          <OrganizationSwitcherPopover close={typeof model.standalone === 'function' ? model.standalone : undefined} />
        ) : (
          <OrganizationSwitcherWithFloatingTree defaultOpen={model.defaultOpen}>
            <OrganizationSwitcherPopover />
          </OrganizationSwitcherWithFloatingTree>
        )}
      </AcceptedInvitationsProvider>
    </OrganizationSwitcherRootView>
  );
};

export const OrganizationSwitcher = withCoreUserGuard(withCardStateProvider(OrganizationSwitcherInternal));
