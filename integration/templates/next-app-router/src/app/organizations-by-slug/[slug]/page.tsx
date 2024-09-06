import { auth } from '@clerk/nextjs/server';

export default function Home({ params }): {} {
  const { orgSlug } = auth();

  if (params.slug != orgSlug) {
    console.log('Mismatch - returning nothing for now...', params.slug, orgSlug);
  }

  console.log("I'm the server and I got this slug: ", orgSlug);

  return (
    <>
      <p>From auth(), I know your org slug is: {orgSlug}</p>
    </>
  );
}
