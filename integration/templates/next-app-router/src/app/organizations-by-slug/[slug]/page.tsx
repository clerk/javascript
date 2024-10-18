import { auth } from '@clerk/nextjs/server';

export default async function Home({ params }: { params: { slug: string } }) {
  const { orgSlug } = await auth();

  if (params.slug != orgSlug) {
    console.log('Mismatch - returning nothing for now...', params.slug, orgSlug);
  }

  console.log("I'm the server and I got this slug: ", orgSlug);

  return (
    <>
      <p>Org-specific home</p>
      <p>From auth(), I know your org slug is: {orgSlug}</p>
    </>
  );
}
