export {
  isMagicLinkError,
  MagicLinkErrorCode,
  isClerkAPIResponseError,
  isKnownError,
  isMetamaskError,
} from '@clerk/shared';

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
  'Invalid state. Feel free to submit a bug or reach out to support here: https://clerk.com/support';

export const unsupportedNonBrowserDomainOrProxyUrlFunction =
  'Unsupported usage of domain or proxyUrl. The usage of domain or proxyUrl as function is not supported in non-browser environments.';

export const userProfilePageRenderedError =
  '<UserProfile.Page /> component needs to be a direct child of `<UserProfile />` or `<UserButton />`.';
export const userProfileLinkRenderedError =
  '<UserProfile.Link /> component needs to be a direct child of `<UserProfile />` or `<UserButton />`.';

export const customPagesIngoredComponent =
  '<UserProfile /> can only accept <UserProfile.Page /> and <UserProfile.Link /> as its children. Any other provided component will be ignored.';

export const userProfilePageWrongProps =
  'Missing props. <UserProfile.Page /> component requires the following props: url, label, labelIcon, alongside with children to be rendered inside the page.';

export const userProfileLinkWrongProps =
  'Missing props. <UserProfile.Link /> component requires the following props: url, label and labelIcon.';
