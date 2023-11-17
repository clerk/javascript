import { SignUp } from '@clerk/clerk-react';

export default function Page() {
  return (
    <div>
      <SignUp
        routing='hash'
        signInUrl={'/hash/sign-in'}
      />
    </div>
  );
}
