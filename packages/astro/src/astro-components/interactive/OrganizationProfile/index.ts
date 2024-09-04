import _OrganizationProfile from './OrganizationProfile.astro';
import OrganizationProfileLink from './OrganizationProfileLink.astro';
import OrganizationProfilePage from './OrganizationProfilePage.astro';

export const OrganizationProfile = Object.assign(_OrganizationProfile, {
  Page: OrganizationProfilePage,
  Link: OrganizationProfileLink,
});
