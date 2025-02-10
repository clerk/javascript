import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  await auth.protect();

  return <div>Protected Page</div>;
}
