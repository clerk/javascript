import { SignIn } from '@clerk/react-router';

export default function SignInPage() {
  return (
    <div>
      <h1>Sign In route</h1>
      <SignIn
        routing={'path'}
        path={'/sign-in'}
        signUpUrl={'/sign-up'}
      />
    </div>
  );
}
