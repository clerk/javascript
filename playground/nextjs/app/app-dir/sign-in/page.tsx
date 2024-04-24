import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <SignIn
      path='/app-dir/sign-in'
      signUpUrl='/app-dir/sign-up'
      redirectUrl='/app-dir'
    />
  );
}
