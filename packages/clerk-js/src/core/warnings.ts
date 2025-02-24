import type { Serializable } from '@clerk/types';

const formatWarning = (msg: string) => {
  return `🔒 Clerk:\n${msg.trim()}\n(This notice only appears in development)`;
};

const createMessageForDisabledOrganizations = (
  componentName: 'OrganizationProfile' | 'OrganizationSwitcher' | 'OrganizationList' | 'CreateOrganization',
) => {
  return formatWarning(
    `The <${componentName}/> cannot be rendered when the feature is turned off. Visit 'dashboard.clerk.com' to enable the feature. Since the feature is turned off, this is no-op.`,
  );
};
const warnings = {
  cannotRenderComponentWhenSessionExists:
    'The <SignUp/> and <SignIn/> components cannot render when a user is already signed in, unless the application allows multiple sessions. Since a user is signed in and this application only allows a single session, Clerk is redirecting to the Home URL instead.',
  cannotRenderSignUpComponentWhenSessionExists:
    'The <SignUp/> component cannot render when a user is already signed in, unless the application allows multiple sessions. Since a user is signed in and this application only allows a single session, Clerk is redirecting to the value set in `afterSignUp` URL instead.',
  cannotRenderSignInComponentWhenSessionExists:
    'The <SignIn/> component cannot render when a user is already signed in, unless the application allows multiple sessions. Since a user is signed in and this application only allows a single session, Clerk is redirecting to the `afterSignIn` URL instead.',
  cannotRenderComponentWithPendingTasks:
    'The component cannot render when a user has pending tasks to resolve, unless the application allows multiple sessions. Since a user is signed in and this application only allows a single session, Clerk is redirecting to the `tasksUrl` instead.',
  cannotRenderComponentWhenUserDoesNotExist:
    '<UserProfile/> cannot render unless a user is signed in. Since no user is signed in, this is no-op.',
  cannotRenderComponentWhenOrgDoesNotExist: `<OrganizationProfile/> cannot render unless an organization is active. Since no organization is currently active, this is no-op.`,
  cannotRenderAnyOrganizationComponent: createMessageForDisabledOrganizations,
  cannotOpenUserProfile:
    'The UserProfile modal cannot render unless a user is signed in. Since no user is signed in, this is no-op.',
  cannotOpenSignInOrSignUp:
    'The SignIn or SignUp modals do not render when a user is already signed in, unless the application allows multiple sessions. Since a user is signed in and this application only allows a single session, this is no-op.',
};

type SerializableWarnings = Serializable<typeof warnings>;

for (const key of Object.keys(warnings)) {
  const item = warnings[key as keyof typeof warnings];
  if (typeof item !== 'function') {
    warnings[key as keyof SerializableWarnings] = formatWarning(item);
  }
}

export { warnings };
