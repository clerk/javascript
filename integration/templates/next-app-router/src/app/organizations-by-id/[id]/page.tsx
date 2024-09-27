import { auth } from '@clerk/nextjs/server';

export default function Home({ params }: { params: { id: string } }) {
  const { orgId } = auth();

  if (params.id != orgId) {
    console.log('Mismatch - returning nothing for now...', params.id, orgId);
  }

  console.log("I'm the server and I got this id: ", orgId);

  return (
    <>
      <p>Org-specific home</p>
      <p>From auth(), I know your org id is: {orgId}</p>
    </>
  );
}
