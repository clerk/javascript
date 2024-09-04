import _OrganizationProfile from './OrganizationProfile.astro';
import OrganizationLink from './OrganizationLink.astro';
import OrganizationPage from './OrganizationPage.astro';

export const OrganizationProfile = Object.assign(_OrganizationProfile, {
  Page: OrganizationPage,
  Link: OrganizationLink,
});
