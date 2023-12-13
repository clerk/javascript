import { auth } from '@clerk/nextjs/server';

export default function Page() {
  auth().protect({ role: 'admin' });
  return <p>User has access</p>;
}
