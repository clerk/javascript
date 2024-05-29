import { generateStylesheet, transform } from '@clerk/tailwindcss-transformer';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'tsup';

import { name, version } from './package.json';

const tailwindcssTransformerCode = {
  name: 'tailwindcss-transformer-code',
  setup(build) {
    const outDir = path.join(process.cwd(), build.initialOptions.outdir);
    const styleCache = new Map();
    build.onLoad({ filter: /.*/ }, async args => {
      const code = await fs.promises.readFile(args.path, 'utf8');
      const transformedCode = transform(code, { styleCache });
      return {
        contents: transformedCode,
        resolveDir: path.dirname(args.path),
        loader: 'tsx',
      };
    });

    build.onEnd(async () => {
      const styleSheet = await generateStylesheet(styleCache, {
        tailwindConfig: path.join(process.cwd(), 'src', 'tailwind.config.ts'),
        globalCss: fs.readFileSync(path.join(process.cwd(), 'src', 'global.css'), 'utf8'),
      });
      await fs.promises.mkdir(outDir, { recursive: true });
      await fs.promises.writeFile(path.join(outDir, 'styles.css'), styleSheet);
    });
  },
};

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';

  return {
    clean: true,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${!isProd}`,
    },
    dts: true,
    entry: {
      'primitives/button': 'src/primitives/button.tsx',
      'primitives/card': 'src/primitives/card.tsx',
      'primitives/connection': 'src/primitives/connection.tsx',
      'primitives/field': 'src/primitives/field.tsx',
      'primitives/seperator': 'src/primitives/seperator.tsx',
      'components/sign-in/index': 'src/components/sign-in/index.tsx',
      'components/sign-up/index': 'src/components/sign-up/index.tsx',
    },
    external: ['react', 'react-dom'],
    format: ['cjs', 'esm'],
    minify: false,
    sourcemap: true,
    esbuildPlugins: [tailwindcssTransformerCode],
  };
});
