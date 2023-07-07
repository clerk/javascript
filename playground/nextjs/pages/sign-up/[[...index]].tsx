import { SignUp } from '@clerk/nextjs';
import type { NextPage } from 'next';

const SignUpPage: NextPage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <SignUp unsafeMetadata={{ playground: 'nextjs', type: 'pages' }} />
    </div>
  );
};

export default SignUpPage;
