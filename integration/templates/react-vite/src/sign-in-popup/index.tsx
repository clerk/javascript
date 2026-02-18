import { SignIn } from '@clerk/clerk-react';

export default function Page() {
  return (
    <div>
      <SignIn
        path={'/sign-in-popup'}
        signUpUrl={'/sign-up'}
        oauthFlow='popup'
        fallbackRedirectUrl='/protected'
        fallback={<>Loading sign in</>}
      />
    </div>
  );
}
