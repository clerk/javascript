import { SignIn } from '@clerk/react-router';

export default function SignInPage() {
  return (
    <div style={{ border: '2px solid blue', padding: '2rem' }}>
      <h1>Sign In route</h1>
      <SignIn
        path='/sign-in'
        signUpUrl='/sign-up'
      />
    </div>
  );
}
