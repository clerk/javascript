import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)'],
  addons: [getAbsolutePath('@storybook/addon-docs'), getAbsolutePath('@storybook/addon-themes')],

  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },

  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop: any) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}
