import { SignUp } from '@clerk/clerk-react';

export default function Page() {
  return (
    <div>
      <SignUp
        path={'/sign-up'}
        signInUrl={'/sign-in'}
        fallback={<>Loading sign up</>}
      />
    </div>
  );
}
