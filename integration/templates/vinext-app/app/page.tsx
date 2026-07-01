import { auth } from '@clerk/nextjs/server';
import { AuthDisplay } from './auth-display';

export default async function Home() {
  const { userId } = await auth();
  return (
    <main>
      <h1>vinext + Clerk</h1>
      <AuthDisplay />
      <p data-clerk-user-id={userId || ''}>{userId ? `server-user-id: ${userId}` : 'server-signed-out'}</p>
    </main>
  );
}
