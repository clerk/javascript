import { SignIn } from '@clerk/nextjs/app-beta';

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
