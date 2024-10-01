import { __experimental_protectComponent } from '@clerk/nextjs';

const Page = __experimental_protectComponent({
  fallback: 'redirectToSignIn',
})
  .with({
    role: 'org:admin',
  })
  .component(() => {
    return <p>User has access</p>;
  });

export default Page;
