import { __experimental_protectComponent } from '@clerk/nextjs';

const Page = __experimental_protectComponent({
  fallback: 'redirectToSignIn',
}).component(() => {
  return <div>Protected Page</div>;
});
export default Page;
