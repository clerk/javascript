export const multipleChildrenInButtonComponent = (name: string) =>
  `You've passed multiple children components to <${name}/>. You can only pass a single child component or text.`;

export const invalidStateError =
  'Invalid state. Feel free to submit a bug or reach out to support here: https://clerk.com/support';

export const useAuthHasRequiresRoleOrPermission =
  'Missing parameters. `has` from `useAuth` requires a permission or role key to be passed. Example usage: `has({permission: "org:posts:edit"})`';

export const userButtonMenuActionRenderedError =
  '<UserButton.Action /> component needs to be a direct child of `<UserButton.MenuItems />`.';

export const userButtonMenuLinkRenderedError =
  '<UserButton.Link /> component needs to be a direct child of `<UserButton.MenuItems />`.';

export const userButtonMenuItemLinkWrongProps =
  'Missing requirements. <UserButton.Link /> component requires props: href, label and slot: labelIcon';

export const userButtonMenuItemActionWrongProps =
  'Missing requirements. <UserButton.Action /> component requires props: label and slot: labelIcon';

export const userButtonMenuItemsRenderedError =
  '<UserButton.MenuItems /> component needs to be a direct child of `<UserButton />`.';
