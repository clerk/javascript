export {
  MagicLinkErrorCode,
  EmailLinkErrorCode,
  isClerkAPIResponseError,
  isKnownError,
  isMetamaskError,
  isMagicLinkError,
  isEmailLinkError,
} from '@clerk/shared/error';

export const noFrontendApiError = 'Clerk: You must add the frontendApi prop to your <ClerkProvider>';

export const noClerkProviderError = 'Clerk: You must wrap your application in a <ClerkProvider> component.';

export const noGuaranteedLoadedError = (hookName: string) =>
  `Clerk: You're calling ${hookName} before there's a guarantee the client has been loaded. Call ${hookName} from a child of <SignedIn>, <SignedOut>, or <ClerkLoaded>, or use the withClerk() HOC.`;

export const noGuaranteedUserError = (hookName: string) =>
  `Clerk: You're calling ${hookName} before there's a guarantee there's an active user. Call ${hookName} from a child of <SignedIn> or use the withUser() HOC.`;

export const multipleClerkProvidersError =
  "Clerk: You've added multiple <ClerkProvider> components in your React component tree. Wrap your components in a single <ClerkProvider>.";

export const hocChildrenNotAFunctionError = 'Clerk: Child of WithClerk must be a function.';

export const multipleChildrenInButtonComponent = (name: string) =>
  `Clerk: You've passed multiple children components to <${name}/>. You can only pass a single child component or text.`;

export const invalidStateError =
  'Clerk: Invalid state. Feel free to submit a bug or reach out to support here: https://clerk.com/support';

export const unsupportedNonBrowserDomainOrProxyUrlFunction =
  'Clerk: Unsupported usage of isSatellite, domain or proxyUrl. The usage of isSatellite, domain or proxyUrl as function is not supported in non-browser environments.';

export const userProfilePageRenderedError =
  'Clerk: <UserProfile.Page /> component needs to be a direct child of `<UserProfile />` or `<UserButton />`.';
export const userProfileLinkRenderedError =
  'Clerk: <UserProfile.Link /> component needs to be a direct child of `<UserProfile />` or `<UserButton />`.';

export const organizationProfilePageRenderedError =
  'Clerk: <OrganizationProfile.Page /> component needs to be a direct child of `<OrganizationProfile />` or `<OrganizationSwitcher />`.';
export const organizationProfileLinkRenderedError =
  'Clerk: <OrganizationProfile.Link /> component needs to be a direct child of `<OrganizationProfile />` or `<OrganizationSwitcher />`.';

export const customPagesIgnoredComponent = (componentName: string) =>
  `Clerk: <${componentName} /> can only accept <${componentName}.Page /> and <${componentName}.Link /> as its children. Any other provided component will be ignored.`;

export const customPageWrongProps = (componentName: string) =>
  `Clerk: Missing props. <${componentName}.Page /> component requires the following props: url, label, labelIcon, alongside with children to be rendered inside the page.`;

export const customLinkWrongProps = (componentName: string) =>
  `Clerk: Missing props. <${componentName}.Link /> component requires the following props: url, label and labelIcon.`;

export const useAuthHasRequiresRoleOrPermission =
  'Clerk: Missing parameters. `has` from `useAuth` requires a permission or role key to be passed. Example usage: `has({permission: "org:posts:edit"`';
