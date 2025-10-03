import { SignIn } from '@clerk/react';

export default function Page() {
  return (
    <div>
      <SignIn
        path={'/sign-in'}
        signUpUrl={'/sign-up'}
        fallback={<>Loading sign in</>}
      />
    </div>
  );
}
