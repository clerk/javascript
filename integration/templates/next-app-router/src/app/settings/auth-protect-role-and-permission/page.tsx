import { auth } from '@clerk/nextjs/server';

// Regression guard: role + permission in the same call must AND. Previously
// the helper returned on the first matching branch (permission wins), which
// let a user with the permission but not the role pass.
export default async function Page() {
  await auth.protect({ role: 'org:admin', permission: 'org:sys_memberships:read' });
  return <p>User has access</p>;
}
