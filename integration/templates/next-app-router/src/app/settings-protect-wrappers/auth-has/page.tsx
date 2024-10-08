import { __experimental_protectComponent } from '@clerk/nextjs';

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

export default Page;
