import { SignUp } from '@clerk/nextjs';
import type { NextPage } from 'next';

const SignUpPage: NextPage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <SignUp path='/sign-up' />
    </div>
  );
};

export default SignUpPage;
