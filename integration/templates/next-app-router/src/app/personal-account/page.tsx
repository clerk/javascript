import { auth } from '@clerk/nextjs/server';

export default async function Home() {
  const { orgId } = await auth();

  if (orgId != null) {
    console.log('Oh no, this page should only activate on the personal account!');
  }

  return (
    <>
      <p>Welcome to your personal account</p>
    </>
  );
}
