import { SignIn } from '@clerk/nextjs';
import type { NextPage } from 'next';

const SignInPage: NextPage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <SignIn path='/sign-in' />
    </div>
  );
};

export default SignInPage;
