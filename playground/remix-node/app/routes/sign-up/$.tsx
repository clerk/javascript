import { SignUp } from '@clerk/remix';

export default function SignUpPage() {
  return (
    <div style={{ border: '2px solid blue', padding: '2rem' }}>
      <h1>Sign Up route</h1>
      <SignUp
        routing='path'
        path='/sign-up'
        signInUrl='/sign-in'
      />
    </div>
  );
}
