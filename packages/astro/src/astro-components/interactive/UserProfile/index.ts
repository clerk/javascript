import _UserProfile from './UserProfile.astro';
import UserProfileLink from './UserProfileLink.astro';
import UserProfilePage from './UserProfilePage.astro';

export const UserProfile = Object.assign(_UserProfile, {
  Page: UserProfilePage,
  Link: UserProfileLink,
});
