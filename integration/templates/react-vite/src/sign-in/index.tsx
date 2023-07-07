import { SignIn } from '@clerk/clerk-react';

export default function Page() {
  return (
    <div>
      <SignIn
        routing={'path'}
        path={'/sign-in'}
        signUpUrl={'/sign-up'}
      />
    </div>
  );
}
