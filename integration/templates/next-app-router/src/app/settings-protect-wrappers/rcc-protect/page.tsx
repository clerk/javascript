'use client';
import { __experimental_protectComponent, useAuth } from '@clerk/nextjs';

const Page = __experimental_protectComponent({
  fallback: () => <p>Signed out!</p>,
})
  .with({
    permission: 'org:posts:manage',
    fallback: () => <p>User is missing permissions</p>,
  })
  .component(() => {
    return <p>User has access</p>;
  });

const Wow = () => {
  const { orgRole, orgId } = useAuth();
  return (
    <>
      <Page />
      {orgRole}
      {orgId}
    </>
  );
};

export default Wow;
