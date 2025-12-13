import { ClerkProvider, SignIn, useAuth } from '@clerk/nextjs';

export default function App({ children }) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          socialButtonsPlacement: 'bottom',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}

export function SignInPage() {
  return (
    <SignIn
      afterSignInUrl='/dashboard'
      afterSignUpUrl='/onboarding'
    />
  );
}

export function SamlCallback() {
  const { isSignedIn } = useAuth();
  // Handle saml callback
  return <div>SAML SSO Callback</div>;
}
