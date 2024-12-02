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
  'Missing props. <UserButton.Link /> component requires the following props: href, label and labelIcon.';

export const userButtonMenuItemsActionWrongsProps =
  'Missing props. <UserButton.Action /> component requires the following props: label.';

export const customPageWrongProps = (componentName: string) =>
  `Missing props. <${componentName}.Page /> component requires the following props: url, label, labelIcon, alongside with children to be rendered inside the page.`;

export const customLinkWrongProps = (componentName: string) =>
  `Missing props. <${componentName}.Link /> component requires the following props: url, label and labelIcon.`;

export const userButtonIgnoredComponent = `<UserButton /> can only accept <UserButton.UserProfilePage />, <UserButton.UserProfileLink /> and <UserButton.MenuItems /> as its children. Any other provided component will be ignored.`;
