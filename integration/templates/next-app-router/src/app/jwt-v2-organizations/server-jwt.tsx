import { auth } from '@clerk/nextjs/server';

export async function ServerJWT() {
  return (
    <>
      <h1>Server JWT</h1>
      <pre data-testid='server-jwt'>{JSON.stringify((await auth()).sessionClaims, null, 4)}</pre>
    </>
  );
}
