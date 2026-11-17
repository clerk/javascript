import createMDX from '@next/mdx';
import { createRequire } from 'module';
import { dirname, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const mosaicRoot = resolve(__dirname, '../mosaic');
const isDev = process.env.NODE_ENV !== 'production';

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: [
      [
        'rehype-raw',
        {
          passThrough: ['mdxjsEsm', 'mdxJsxFlowElement', 'mdxJsxTextElement', 'mdxFlowExpression', 'mdxTextExpression'],
        },
      ],
      'rehype-slug',
    ],
    allowDangerousHtml: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['tsx', 'ts', 'mdx'],
  experimental: { turbopackUseBuiltinBabel: false },
  turbopack: {
    root: resolve(__dirname, '../..'),
    resolveAlias: {
      '@clerk/mosaic': '../mosaic/src',
      '@clerk/mosaic/*': '../mosaic/src/*',
      '@floating-ui/react': relative(__dirname, dirname(require.resolve('@floating-ui/react/package.json'))).replaceAll(
        '\\',
        '/',
      ),
    },
    rules: {
      '*': {
        condition: { query: /[?&]raw(?:[=&]|$)/ },
        type: 'raw',
      },
      '*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}': {
        condition: {
          all: [{ not: 'foreign' }, { not: { query: /[?&]raw(?:[=&]|$)/ } }, { content: /@stylexjs\/stylex/ }],
        },
        loaders: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              configFile: false,
              presets: [require.resolve('@babel/preset-typescript')],
              plugins: [
                require.resolve('@babel/plugin-syntax-jsx'),
                [
                  require.resolve('@stylexjs/babel-plugin'),
                  {
                    dev: isDev,
                    runtimeInjection: isDev,
                    unstable_moduleResolution: { type: 'commonJS', rootDir: mosaicRoot },
                    aliases: { '@clerk/mosaic/*': [resolve(mosaicRoot, 'src/*')] },
                  },
                ],
              ],
            },
          },
        ],
      },
      '*.{js,mjs}': {
        condition: {
          all: ['development', { path: /@stylexjs\/stylex\/lib\/(es|cjs)\/inject\.(mjs|js)$/ }],
        },
        loaders: [resolve(__dirname, 'src/lib/loaders/stylex-inject-named-container.cjs')],
      },
    },
  },
};

export default withMDX(nextConfig);
