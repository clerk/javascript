export const noClerkProviderError = 'You must wrap your application in a <ClerkProvider> component.';

export const multipleClerkProvidersError =
  "You've added multiple <ClerkProvider> components in your React component tree. Wrap your components in a single <ClerkProvider>.";

export const hocChildrenNotAFunctionError = 'Child of WithClerk must be a function.';

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
  `<${componentName} /> can only accept <${componentName}.Page /> and <${componentName}.Link /> as its children. Any other provided component will be ignored.`;

export const customPageWrongProps = (componentName: string) =>
  `Missing props. <${componentName}.Page /> component requires the following props: url, label, labelIcon, alongside with children to be rendered inside the page.`;

export const customLinkWrongProps = (componentName: string) =>
  `Missing props. <${componentName}.Link /> component requires the following props: url, label and labelIcon.`;

export const useAuthHasRequiresRoleOrPermission =
  'Missing parameters. `has` from `useAuth` requires a permission or role key to be passed. Example usage: `has({permission: "org:posts:edit"`';

export const noPathProvidedError = (componentName: string) =>
  `<${componentName}/> is missing a path prop to work with path based routing`;
