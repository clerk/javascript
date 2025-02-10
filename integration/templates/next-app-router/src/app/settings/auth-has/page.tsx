import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  const { userId, has } = await auth();
  if (!userId || !has({ permission: 'org:posts:manage' })) {
    return <p>User is missing permissions</p>;
  }
  return <p>User has access</p>;
}
