import { auth } from '@clerk/nextjs/server';

export default function Home(): {} {
  const { orgId } = auth();

  if (orgId != null) {
    console.log('Oh no, this page should only activate on the personal account!');
  }

  return (
    <>
      <p>Welcome to your personal account</p>
    </>
  );
}
