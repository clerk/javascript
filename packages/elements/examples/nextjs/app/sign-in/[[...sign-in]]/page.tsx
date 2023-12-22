import { SignIn, SignInFactorOne, SignInFactorTwo, SignInSSOCallback, SignInStart } from '@clerk/elements';

export default function SignInPage() {
  return (
    <SignIn>
      <SignInStart>
        <p>Start child</p>
      </SignInStart>
      <SignInFactorOne>
        <p>Factor one child</p>
      </SignInFactorOne>
      <SignInFactorTwo>
        <p>Factor two child</p>
      </SignInFactorTwo>
      <SignInSSOCallback />
    </SignIn>
  );
}
