import { __experimental_protectComponent } from '@clerk/nextjs';

const Page = __experimental_protectComponent()
  .with({
    role: 'org:admin',
    fallback: () => <p>User is not admin</p>,
  })
  .component(() => {
    return <p>User has access</p>;
  });

export default Page;
