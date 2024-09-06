import { auth } from '@clerk/nextjs/server';

export default function Home({ params }): {} {
  const { orgId } = auth();

  if (params.id != orgId) {
    console.log('Mismatch - returning nothing for now...', params.slug, orgId);
  }

  console.log("I'm the server and I got this slug: ", orgId);

  return (
    <>
      <p>From auth(), I know your org slug is: {orgId}</p>
    </>
  );
}
