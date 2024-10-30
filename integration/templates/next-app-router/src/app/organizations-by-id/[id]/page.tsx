import { auth } from '@clerk/nextjs/server';

export default async function Home({ params }: { params: Promise<{ id: string }> }) {
  const { orgId } = await auth();
  const paramsId = (await params).id;

  if (paramsId != orgId) {
    console.log('Mismatch - returning nothing for now...', paramsId, orgId);
  }

  console.log("I'm the server and I got this id: ", orgId);

  return (
    <>
      <p>Org-specific home</p>
      <p>From auth(), I know your org id is: {orgId}</p>
    </>
  );
}
