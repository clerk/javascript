export const fixtures = [
  {
    name: 'ClerkProvider legacy redirect props',
    source: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider
      afterSignInUrl='/dashboard'
      afterSignUpUrl='/welcome'
    >
      {children}
    </ClerkProvider>
  );
}
    `,
    output: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl='/dashboard'
      signUpFallbackRedirectUrl='/welcome'
    >
      {children}
    </ClerkProvider>
  );
}
    `,
  },
  {
    name: 'SignIn legacy props',
    source: `
import { SignIn as MySignIn } from '@clerk/nextjs';

export const Page = () => (
  <MySignIn
    afterSignInUrl='/home'
    afterSignUpUrl='/after-sign-up'
    fallbackRedirectUrl='/existing'
  />
);
    `,
    output: `
import { SignIn as MySignIn } from '@clerk/nextjs';

export const Page = () => (
  <MySignIn
    signUpFallbackRedirectUrl='/after-sign-up'
    fallbackRedirectUrl='/existing' />
);
    `,
  },
  {
    name: 'SignUp legacy props',
    source: `
import { SignUp } from '@clerk/react';

export function Example() {
  return (
    <SignUp afterSignUpUrl='/done' afterSignInUrl='/in' />
  );
}
    `,
    output: `
import { SignUp } from '@clerk/react';

export function Example() {
  return (<SignUp fallbackRedirectUrl='/done' signInFallbackRedirectUrl='/in' />);
}
    `,
  },
  {
    name: 'ClerkProvider redirectUrl only',
    source: `
import { ClerkProvider } from '@clerk/react';

export const Provider = ({ children }) => (
  <ClerkProvider redirectUrl='/legacy'>{children}</ClerkProvider>
);
    `,
    output: `
import { ClerkProvider } from '@clerk/react';

export const Provider = ({ children }) => (
  <ClerkProvider signInFallbackRedirectUrl="/legacy" signUpFallbackRedirectUrl="/legacy">{children}</ClerkProvider>
);
    `,
  },
  {
    name: 'SignIn redirectUrl only',
    source: `
import { SignIn } from '@clerk/nextjs';

export const Page = () => <SignIn redirectUrl='/legacy' />;
    `,
    output: `
import { SignIn } from '@clerk/nextjs';

export const Page = () => <SignIn fallbackRedirectUrl="/legacy" />;
    `,
  },
  {
    name: 'UserButton and organization props',
    source: `
import { UserButton, OrganizationSwitcher, CreateOrganization } from '@clerk/react';

export const Actions = () => (
  <>
    <UserButton afterSignOutUrl='/bye' afterMultiSessionSingleSignOutUrl='/multi' />
    <OrganizationSwitcher hideSlug afterSwitchOrganizationUrl='/org' />
    <CreateOrganization hideSlug />
  </>
);
    `,
    output: `
import { UserButton, OrganizationSwitcher, CreateOrganization } from '@clerk/react';

export const Actions = () => (
  <>
    <UserButton />
    <OrganizationSwitcher afterSelectOrganizationUrl='/org' />
    <CreateOrganization />
  </>
);
    `,
  },
  {
    name: 'Object literals and destructuring',
    source: `
const config = {
  afterSignInUrl: '/one',
  afterSignUpUrl: '/two',
  activeSessions,
};

const { afterSignInUrl, afterSignUpUrl: custom, activeSessions: current } = config;
    `,
    output: `
const config = {
  signInFallbackRedirectUrl: '/one',
  signUpFallbackRedirectUrl: '/two',
  signedInSessions: activeSessions,
};

const { signInFallbackRedirectUrl: afterSignInUrl, signUpFallbackRedirectUrl: custom, signedInSessions: current } = config;
    `,
  },
  {
    name: 'Member expressions and optional chaining',
    source: `
const signInTarget = options.afterSignInUrl;
const signUpTarget = options?.afterSignUpUrl;
const fallback = options['afterSignInUrl'];
const hasSessions = client?.activeSessions?.length > 0 && client['activeSessions'];
    `,
    output: `
const signInTarget = options.signInFallbackRedirectUrl;
const signUpTarget = options?.signUpFallbackRedirectUrl;
const fallback = options["signInFallbackRedirectUrl"];
const hasSessions = client?.signedInSessions?.length > 0 && client["signedInSessions"];
    `,
  },
  {
    name: 'setActive beforeEmit callback',
    source: `
await setActive({
  session: '123',
  beforeEmit: handleBeforeEmit,
});
    `,
    output: `
await setActive({
  session: '123',
  navigate: params => handleBeforeEmit(params.session),
});
    `,
  },
  {
    name: 'ClerkMiddlewareAuthObject type rename',
    source: `
import type { ClerkMiddlewareAuthObject } from '@clerk/nextjs/server';

type Handler = (auth: ClerkMiddlewareAuthObject) => void;
    `,
    output: `
import type { ClerkMiddlewareSessionAuthObject } from '@clerk/nextjs/server';

type Handler = (auth: ClerkMiddlewareSessionAuthObject) => void;
    `,
  },
  {
    name: 'Namespace import support',
    source: `
import * as Clerk from '@clerk/nextjs';

export const Provider = ({ children }) => (
  <Clerk.ClerkProvider redirectUrl='/deep' />
);
    `,
    output: `
import * as Clerk from '@clerk/nextjs';

export const Provider = ({ children }) => (
  <Clerk.ClerkProvider signInFallbackRedirectUrl="/deep" signUpFallbackRedirectUrl="/deep" />
);
    `,
  },
  {
    name: 'clerkJSVariant headless to prefetchUI false',
    source: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider
      clerkJSVariant="headless"
      publishableKey="pk_test_123"
    >
      {children}
    </ClerkProvider>
  );
}
    `,
    output: `
import { ClerkProvider } from '@clerk/nextjs';

export function App({ children }) {
  return (
    <ClerkProvider
      prefetchUI={false}
      publishableKey="pk_test_123"
    >
      {children}
    </ClerkProvider>
  );
}
    `,
  },
  {
    name: 'clerkJSVariant empty string removal',
    source: `
import { ClerkProvider } from '@clerk/react';

export const Provider = ({ children }) => (
  <ClerkProvider clerkJSVariant="">{children}</ClerkProvider>
);
    `,
    output: `
import { ClerkProvider } from '@clerk/react';

export const Provider = ({ children }) => (
  <ClerkProvider>{children}</ClerkProvider>
);
    `,
  },
  {
    name: 'getToken leewayInSeconds removal - direct call',
    source: `
const token = await getToken({ leewayInSeconds: 30 });
    `,
    output: `
const token = await getToken();
    `,
  },
  {
    name: 'getToken leewayInSeconds removal - member expression',
    source: `
const token = await session.getToken({ leewayInSeconds: 30, template: 'custom' });
    `,
    output: `
const token = await session.getToken({
  template: 'custom'
});
    `,
  },
  {
    name: 'getToken leewayInSeconds removal - optional chaining',
    source: `
const token = await session?.getToken({ leewayInSeconds: 15, organizationId: 'org_123' });
    `,
    output: `
const token = await session?.getToken({
  organizationId: 'org_123'
});
    `,
  },
  {
    name: 'getToken leewayInSeconds removal - multiple options',
    source: `
const token = await getToken({
  template: 'my-template',
  leewayInSeconds: 20,
  organizationId: 'org_abc',
  skipCache: true
});
    `,
    output: `
const token = await getToken({
  template: 'my-template',
  organizationId: 'org_abc',
  skipCache: true
});
    `,
  },
];
