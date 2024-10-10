import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  const { protect } = await auth();
  protect({ role: 'admin' });
  return <p>User has access</p>;
}
