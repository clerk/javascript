import { useOrganizationSwitcherContext } from '../../contexts';
import type { OrganizationSwitcherRootData } from './organization-switcher.types';

export const useOrganizationSwitcherRootModel = (): OrganizationSwitcherRootData => {
  const { __experimental_asStandalone, defaultOpen } = useOrganizationSwitcherContext();

  return { standalone: __experimental_asStandalone, defaultOpen };
};
