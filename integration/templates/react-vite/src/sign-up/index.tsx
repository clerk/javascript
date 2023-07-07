import { SignUp } from '@clerk/clerk-react';

export default function Page() {
  return (
    <div>
      <SignUp
        path={'/sign-up'}
        routing={'path'}
        signInUrl={'/sign-in'}
      />
    </div>
  );
}
