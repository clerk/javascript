import { useOrganizationSwitcherPrefetchModel } from './prefetch-organization-list.model';
import { OrganizationSwitcherPrefetchView } from './prefetch-organization-list.view';

export function OrganizationSwitcherPrefetch() {
  useOrganizationSwitcherPrefetchModel();
  return <OrganizationSwitcherPrefetchView />;
}
