import { SignIn } from '@clerk/react';

export default function Page() {
  return (
    <div>
      <SignIn
        routing='hash'
        signUpUrl={'/sign-up'}
        oauthFlow='popup'
        fallbackRedirectUrl='/protected'
        fallback={<>Loading sign in</>}
      />
    </div>
  );
}
