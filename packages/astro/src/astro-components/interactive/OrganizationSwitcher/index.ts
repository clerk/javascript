import _OrganizationSwitcher from './OrganizationSwitcher.astro';
import OrganizationProfilePage from './OrganizationProfilePage.astro';
import OrganizationProfileLink from './OrganizationProfileLink.astro';

export const OrganizationSwitcher = Object.assign(_OrganizationSwitcher, {
  OrganizationProfilePage,
  OrganizationProfileLink,
});
