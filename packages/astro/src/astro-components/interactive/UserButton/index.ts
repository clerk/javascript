// @ts-nocheck
// We're using @ts-nocheck here because this file gets copied to the dist folder
// when published and is not bundled with tsup. This can cause TS to throw errors
// even though we're not bundling it.

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
