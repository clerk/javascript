import { auth } from '@clerk/nextjs/server';

export default async function Home({ params }: { params: Promise<{ slug: string }> }) {
  const { orgSlug } = await auth();
  const paramsSlug = (await params).slug;

  if (paramsSlug != orgSlug) {
    console.log('Mismatch - returning nothing for now...', paramsSlug, orgSlug);
  }

  console.log("I'm the server and I got this slug: ", orgSlug);

  return (
    <>
      <p>Org-specific settings</p>
      <p>From auth(), I know your org slug is: {orgSlug}</p>
    </>
  );
}
