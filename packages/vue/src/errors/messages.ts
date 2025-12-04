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
  'Missing requirements. <UserButton.Link /> component requires props: href, label and slots: labelIcon.';

export const userButtonMenuItemActionWrongProps =
  'Missing requirements. <UserButton.Action /> component requires props: label and slots: labelIcon.';

export const userButtonMenuItemsRenderedError =
  '<UserButton.MenuItems /> component needs to be a direct child of `<UserButton />`.';

export const customPageWrongProps = (componentName: string) =>
  `Missing requirements. <${componentName}.Page /> component requires props: url, label and slots: labelIcon and a default slot for page content`;

export const customLinkWrongProps = (componentName: string) =>
  `Missing requirements. <${componentName}.Link /> component requires the following props: url, label and slots: labelIcon.`;

export const userProfilePageRenderedError =
  '<UserProfile.Page /> component needs to be a direct child of `<UserProfile />` or `<UserButton />`.';
export const userProfileLinkRenderedError =
  '<UserProfile.Link /> component needs to be a direct child of `<UserProfile />` or `<UserButton />`.';

export const organizationProfilePageRenderedError =
  '<OrganizationProfile.Page /> component needs to be a direct child of `<OrganizationProfile />` or `<OrganizationSwitcher />`.';
export const organizationProfileLinkRenderedError =
  '<OrganizationProfile.Link /> component needs to be a direct child of `<OrganizationProfile />` or `<OrganizationSwitcher />`.';

export const noPathProvidedError = (componentName: string) =>
  `The <${componentName}/> component uses path-based routing by default unless a different routing strategy is provided using the \`routing\` prop. When path-based routing is used, you need to provide the path where the component is mounted on by using the \`path\` prop. Example: <${componentName} path={'/my-path'} />`;

export const incompatibleRoutingWithPathProvidedError = (componentName: string) =>
  `The \`path\` prop will only be respected when the Clerk component uses path-based routing. To resolve this error, pass \`routing='path'\` to the <${componentName}/> component, or drop the \`path\` prop to switch to hash-based routing. For more details please refer to our docs: https://clerk.com/docs`;
