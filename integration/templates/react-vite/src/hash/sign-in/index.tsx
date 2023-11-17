import { SignIn } from '@clerk/clerk-react';

export default function Page() {
  return (
    <div>
      <SignIn
        routing='hash'
        signUpUrl={'/hash/sign-up'}
      />
    </div>
  );
}
