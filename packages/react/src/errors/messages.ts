export const noClerkProviderError = 'You must wrap your application in a <ClerkProvider> component.';

export const multipleClerkProvidersError =
  "You've added multiple <ClerkProvider> components in your React component tree. Wrap your components in a single <ClerkProvider>.";

export const multipleChildrenInButtonComponent = (name: string) =>
  `You've passed multiple children components to <${name}/>. You can only pass a single child component or text.`;

export const invalidStateError =
  'Invalid state. Feel free to submit a bug or reach out to support here: https://clerk.com/support';

export const unsupportedNonBrowserDomainOrProxyUrlFunction =
  'Unsupported usage of isSatellite, domain or proxyUrl. The usage of isSatellite, domain or proxyUrl as function is not supported in non-browser environments.';

export const userProfilePageRenderedError =
  '<UserProfile.Page /> component needs to be a direct child of `<UserProfile />` or `<UserButton />`.';
export const userProfileLinkRenderedError =
  '<UserProfile.Link /> component needs to be a direct child of `<UserProfile />` or `<UserButton />`.';

export const organizationProfilePageRenderedError =
  '<OrganizationProfile.Page /> component needs to be a direct child of `<OrganizationProfile />` or `<OrganizationSwitcher />`.';
export const organizationProfileLinkRenderedError =
  '<OrganizationProfile.Link /> component needs to be a direct child of `<OrganizationProfile />` or `<OrganizationSwitcher />`.';

export const customPagesIgnoredComponent = (componentName: string) =>
  `<${componentName} /> can only accept <${componentName}.Page /> and <${componentName}.Link /> as its children. Any other provided component will be ignored. Additionally, please ensure that the component is rendered in a client component.`;

export const customPageWrongProps = (componentName: string) =>
  `Missing props. <${componentName}.Page /> component requires the following props: url, label, labelIcon, alongside with children to be rendered inside the page.`;

export const customLinkWrongProps = (componentName: string) =>
  `Missing props. <${componentName}.Link /> component requires the following props: url, label and labelIcon.`;

export const useAuthHasRequiresRoleOrPermission =
  'Missing parameters. `has` from `useAuth` requires a permission or role key to be passed. Example usage: `has({permission: "org:posts:edit"`';

export const noPathProvidedError = (componentName: string) =>
  `The <${componentName}/> component uses path-based routing by default unless a different routing strategy is provided using the \`routing\` prop. When path-based routing is used, you need to provide the path where the component is mounted on by using the \`path\` prop. Example: <${componentName} path={'/my-path'} />`;

export const incompatibleRoutingWithPathProvidedError = (componentName: string) =>
  `The \`path\` prop will only be respected when the Clerk component uses path-based routing. To resolve this error, pass \`routing='path'\` to the <${componentName}/> component, or drop the \`path\` prop to switch to hash-based routing. For more details please refer to our docs: https://clerk.com/docs`;

export const userButtonIgnoredComponent = `<UserButton /> can only accept <UserButton.UserProfilePage />, <UserButton.UserProfileLink /> and <UserButton.MenuItems /> as its children. Any other provided component will be ignored. Additionally, please ensure that the component is rendered in a client component.`;

export const customMenuItemsIgnoredComponent =
  '<UserButton.MenuItems /> component can only accept <UserButton.Action /> and <UserButton.Link /> as its children. Any other provided component will be ignored. Additionally, please ensure that the component is rendered in a client component.';

export const userButtonMenuItemsRenderedError =
  '<UserButton.MenuItems /> component needs to be a direct child of `<UserButton />`.';

export const userButtonMenuActionRenderedError =
  '<UserButton.Action /> component needs to be a direct child of `<UserButton.MenuItems />`.';

export const userButtonMenuLinkRenderedError =
  '<UserButton.Link /> component needs to be a direct child of `<UserButton.MenuItems />`.';

export const userButtonMenuItemLinkWrongProps =
  'Missing props. <UserButton.Link /> component requires the following props: href, label and labelIcon.';

export const userButtonMenuItemsActionWrongsProps =
  'Missing props. <UserButton.Action /> component requires the following props: label.';
