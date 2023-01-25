import type { GatsbyNode } from 'gatsby';

// @stef
// TODO: Do we need this
export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = ({ actions, stage }) => {
  const excludedStages: Array<typeof stage> = ['build-javascript', 'develop'];
  if (excludedStages.includes(stage)) {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /gatsby-plugin-clerk\/ssr/,
            use: ['null-loader'],
          },
        ],
      },
    });
  }
};
