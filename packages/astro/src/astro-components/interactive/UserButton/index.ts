import UserButtonMain from './UserButton.astro'
import UserButtonLink from './UserButtonLink.astro'
import UserButtonAction from './UserButtonAction.astro'
import UserButtonMenuItems from './UserButtonMenuItems.astro'

export const UserButton = Object.assign(UserButtonMain, {
  MenuItems: UserButtonMenuItems,
  Link: UserButtonLink,
  Action: UserButtonAction,
})
