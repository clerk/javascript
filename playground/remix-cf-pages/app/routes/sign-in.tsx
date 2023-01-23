import { SignIn } from '@clerk/remix';

export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Sign In 2</h1>
      <SignIn />
    </div>
  );
}
