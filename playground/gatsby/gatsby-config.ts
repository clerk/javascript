import type { GatsbyConfig } from 'gatsby';

require('dotenv').config();

const config: GatsbyConfig = {
  siteMetadata: {
    title: `My Gatsby Site`,
    siteUrl: `https://www.yourdomain.tld`,
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  plugins: [
    {
      resolve: 'gatsby-plugin-clerk',
      options: {
        frontendApi: 'clerk.touched.possum-64.lcl.dev',
        // clerkJSUrl: 'https://js.lclclerk.com/npm/clerk.browser.js',
      },
    },
  ],
};

export default config;
