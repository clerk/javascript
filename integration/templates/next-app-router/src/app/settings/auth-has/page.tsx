import { auth } from '@clerk/nextjs/server';

export default function Page() {
  const { userId, has } = auth();
  if (!userId || !has({ permission: 'org:posts:manage' })) {
    return <p>User is missing permissions</p>;
  }
  return <p>User has access</p>;
}
