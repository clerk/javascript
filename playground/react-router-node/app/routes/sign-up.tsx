import { SignUp } from '@clerk/react-router';

export default function SignUpPage() {
  return (
    <div style={{ border: '2px solid blue', padding: '2rem' }}>
      <h1>Sign Up route</h1>
      <SignUp
        signInUrl='/sign-in'
      />
    </div>
  );
}
