import { auth } from '@clerk/nextjs/server';

export default async function Protected() {
  const { userId } = await auth.protect();
  return (
    <main>
      <h1>Protected Page</h1>
      <p>User ID: {userId}</p>
    </main>
  );
}
