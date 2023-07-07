import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <SignUp
        routing={'path'}
        path={'/sign-up'}
        signInUrl={'/sign-in'}
      />
    </div>
  );
}
