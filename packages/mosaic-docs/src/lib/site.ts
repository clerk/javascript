const status =
  'Mosaic is in active development. Its components and primitives can have breaking changes in minor releases, so pin an exact version.';
const clerkDocsUrl = 'https://clerk.com/docs';

export const site = {
  name: 'Mosaic',
  url: 'https://mosaic.clerk.com',
  description: 'Clerk’s design system: components and primitives.',
  status,
  details: `${status} Install with \`pnpm add --save-exact @clerk/mosaic\`. Each page below documents one component or primitive: what to use it for, its practices, its API and examples. For the rest of Clerk, including its SDKs and prebuilt UI components like \`<SignIn />\`, see [Clerk’s docs](${clerkDocsUrl}).`,
  githubUrl: 'https://github.com/clerk/javascript/tree/main/packages/mosaic',
  copyright: `© ${new Date().getFullYear()} Clerk. MIT licensed.`,
  clerkDocsUrl,
  changelogUrl: 'https://github.com/clerk/javascript/blob/main/packages/mosaic/CHANGELOG.md',
};
