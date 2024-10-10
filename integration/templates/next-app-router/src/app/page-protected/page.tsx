import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  const { protect } = await auth();
  protect();
  return <div>Protected Page</div>;
}
