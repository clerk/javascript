import _UserButton from './UserButton.astro';
import UserButtonLink from './UserButtonLink.astro';
import UserButtonAction from './UserButtonAction.astro';
import UserButtonMenuItems from './UserButtonMenuItems.astro';
import UserButtonUserProfilePage from './UserButtonUserProfilePage.astro';

export const UserButton = Object.assign(_UserButton, {
  MenuItems: UserButtonMenuItems,
  Link: UserButtonLink,
  Action: UserButtonAction,
  UserProfilePage: UserButtonUserProfilePage,
});
