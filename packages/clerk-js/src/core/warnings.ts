const formatWarning = (msg: string) => {
  return `🔒 Clerk:\n${msg.trim()}\n(This notice only appears in development)`;
};

const warnings = {
  cannotRenderComponentWhenSessionExists:
    'The <SignUp/> and <SignIn/> components cannot render when a user is already signed in, unless the application allows multiple sessions. Since a user is signed in and this application only allows a single session, Clerk is redirecting to the Home URL instead.',
  cannotRenderSignUpComponentWhenSessionExists:
    'The <SignUp/> component cannot render when a user is already signed in, unless the application allows multiple sessions. Since a user is signed in and this application only allows a single session, Clerk is redirecting to the value setted in `afterSignUp` URL instead.',
  cannotRenderSignInComponentWhenSessionExists:
    'The <SignIn/> component cannot render when a user is already signed in, unless the application allows multiple sessions. Since a user is signed in and this application only allows a single session, Clerk is redirecting to the `afterSignIn` URL instead.',
  cannotRenderComponentWhenUserDoesNotExist:
    '<UserProfile/> cannot render unless a user is signed in. Since no user is signed in, Clerk is redirecting to the Home URL instead. (This notice only appears in development.)',
  cannotRenderComponentWhenOrgDoesNotExist: `<OrganizationProfile/> cannot render unless an organization is active. Since no organization is currently active, Clerk is redirecting to the Home URL instead.`,
  cannotOpenOrgProfile:
    'The OrganizationProfile cannot render unless an organization is active. Since no organization is currently active, this is no-op.',
  cannotOpenUserProfile:
    'The UserProfile modal cannot render unless a user is signed in. Since no user is signed in, this is no-op.',
  cannotOpenSignUpOrSignUp:
    'The SignIn or SignUp modals do not render when a user is already signed in, unless the application allows multiple sessions. Since a user is signed in and this application only allows a single session, this is no-op.',
};

for (const key of Object.keys(warnings)) {
  warnings[key as keyof typeof warnings] = formatWarning(warnings[key as keyof typeof warnings]);
}

export { warnings };
