import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <SignIn
        routing={'hash'}
        signUpUrl={'/hash/sign-up'}
      />
    </div>
  );
}
