import stylexPlugin from '@stylexjs/rollup-plugin';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig } from 'tsdown';

import { mosaicLightningCssTargets } from './stylex-lightningcss.config.mjs';

const require = createRequire(import.meta.url);
const typescriptDir = dirname(require.resolve('typescript/package.json'));
const { default: getTypeScriptExecutablePath } = await import(
  pathToFileURL(join(typescriptDir, 'lib/getExePath.js')).href
);

export default defineConfig({
  entry: {
    index: './src/index.ts',
    'components/action-bar': './src/components/action-bar/index.ts',
    'components/action-menu': './src/components/action-menu/index.ts',
    'components/avatar': './src/components/avatar/index.ts',
    'components/badge': './src/components/badge/index.ts',
    'components/banner': './src/components/banner/index.ts',
    'components/button': './src/components/button/index.ts',
    'components/card': './src/components/card/index.ts',
    'components/checkbox': './src/components/checkbox/index.ts',
    'components/combobox': './src/components/combobox/index.ts',
    'components/copy-button': './src/components/copy-button/index.ts',
    'components/data-list': './src/components/data-list/index.ts',
    'components/dialog': './src/components/dialog/index.ts',
    'components/drawer': './src/components/drawer/index.ts',
    'components/empty-state': './src/components/empty-state/index.ts',
    'components/entity': './src/components/entity/index.ts',
    'components/field': './src/components/field/index.ts',
    'components/flow': './src/components/flow/index.ts',
    'components/heading': './src/components/heading/index.ts',
    'components/icon': './src/components/icon/index.ts',
    'components/input': './src/components/input/index.ts',
    'components/input-group': './src/components/input-group/index.ts',
    'components/item': './src/components/item/index.ts',
    'components/link': './src/components/link/index.ts',
    'components/menu': './src/components/menu/index.ts',
    'components/otp': './src/components/otp/index.ts',
    'components/pagination': './src/components/pagination/index.ts',
    'components/panel': './src/components/panel/index.ts',
    'components/password-input': './src/components/password-input/index.ts',
    'components/phone-input': './src/components/phone-input/index.ts',
    'components/popover': './src/components/popover/index.ts',
    'components/profile': './src/components/profile/index.ts',
    'components/provider-button': './src/components/provider-button/index.ts',
    'components/radio': './src/components/radio/index.ts',
    'components/reveal': './src/components/reveal/index.ts',
    'components/section': './src/components/section/index.ts',
    'components/segmented-control': './src/components/segmented-control/index.ts',
    'components/select': './src/components/select/index.ts',
    'components/separator': './src/components/separator/index.ts',
    'components/skeleton': './src/components/skeleton/index.ts',
    'components/spinner': './src/components/spinner/index.ts',
    'components/stepper': './src/components/stepper/index.ts',
    'components/switch': './src/components/switch/index.ts',
    'components/switcher': './src/components/switcher/index.ts',
    'components/table': './src/components/table/index.ts',
    'components/tabs': './src/components/tabs/index.ts',
    'components/tag-input': './src/components/tag-input/index.ts',
    'components/text': './src/components/text/index.ts',
    'components/tooltip': './src/components/tooltip/index.ts',
    'components/visually-hidden': './src/components/visually-hidden/index.ts',
    'icons/glyphs/arrow-up-right': './src/icons/glyphs/arrow-up-right.tsx',
    'icons/glyphs/building': './src/icons/glyphs/building.tsx',
    'icons/glyphs/checkmark': './src/icons/glyphs/checkmark.tsx',
    'icons/glyphs/chevron-down': './src/icons/glyphs/chevron-down.tsx',
    'icons/glyphs/chevron-right': './src/icons/glyphs/chevron-right.tsx',
    'icons/glyphs/code': './src/icons/glyphs/code.tsx',
    'icons/glyphs/cog-6-teeth': './src/icons/glyphs/cog-6-teeth.tsx',
    'icons/glyphs/ellipsis-horizontal': './src/icons/glyphs/ellipsis-horizontal.tsx',
    'icons/glyphs/external': './src/icons/glyphs/external.tsx',
    'icons/glyphs/key': './src/icons/glyphs/key.tsx',
    'icons/glyphs/plus': './src/icons/glyphs/plus.tsx',
    'icons/glyphs/security-lock-square': './src/icons/glyphs/security-lock-square.tsx',
    'icons/glyphs/security-phone': './src/icons/glyphs/security-phone.tsx',
    'icons/glyphs/shield-check': './src/icons/glyphs/shield-check.tsx',
    'icons/glyphs/sign-out': './src/icons/glyphs/sign-out.tsx',
    'icons/glyphs/switch-account': './src/icons/glyphs/switch-account.tsx',
    'icons/glyphs/user-circle': './src/icons/glyphs/user-circle.tsx',
    'icons/glyphs/users-add-right': './src/icons/glyphs/users-add-right.tsx',
    'primitives/accordion': './src/primitives/accordion/index.ts',
    'primitives/autocomplete': './src/primitives/autocomplete/index.ts',
    'primitives/button': './src/primitives/button/index.ts',
    'primitives/collapsible': './src/primitives/collapsible/index.ts',
    'primitives/combobox': './src/primitives/combobox/index.ts',
    'primitives/dialog': './src/primitives/dialog/index.ts',
    'primitives/direction-provider': './src/primitives/direction-provider/index.ts',
    'primitives/drawer': './src/primitives/drawer/index.ts',
    'primitives/file-upload': './src/primitives/file-upload/index.ts',
    'primitives/flow': './src/primitives/flow/index.ts',
    'primitives/form': './src/primitives/form/index.ts',
    'primitives/image-cropper': './src/primitives/image-cropper/index.ts',
    'primitives/menu': './src/primitives/menu/index.ts',
    'primitives/otp': './src/primitives/otp/index.ts',
    'primitives/popover': './src/primitives/popover/index.ts',
    'primitives/portal': './src/primitives/portal/index.ts',
    'primitives/segmented-control': './src/primitives/segmented-control/index.ts',
    'primitives/select': './src/primitives/select/index.ts',
    'primitives/table': './src/primitives/table/index.ts',
    'primitives/tabs': './src/primitives/tabs/index.ts',
    'primitives/tag-input': './src/primitives/tag-input/index.ts',
    'primitives/toast': './src/primitives/toast/index.ts',
    'primitives/tooltip': './src/primitives/tooltip/index.ts',
  },
  outDir: './dist',
  format: ['esm'],
  dts: {
    sourcemap: true,
    tsgo: { path: getTypeScriptExecutablePath() },
  },
  clean: true,
  unbundle: true,
  outputOptions: options => ({
    entryFileNames: chunk => {
      const pattern =
        typeof options.entryFileNames === 'function'
          ? options.entryFileNames(chunk)
          : (options.entryFileNames ?? '[name].js');
      const vendored = /(?:^|\/)node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?((?:@[^/]+\/)?[^/]+)\/(.+)$/.exec(
        chunk.name,
      );
      return vendored ? pattern.replace('[name]', `_vendor/${vendored[1]}/${vendored[2]}`) : pattern;
    },
  }),
  target: 'es2022',
  platform: 'browser',
  minify: false,
  sourcemap: false,
  tsconfig: './tsconfig.json',
  deps: {
    neverBundle: ['react', 'react-dom', /^@clerk\/shared(\/.*)?$/],
    alwaysBundle: [/^@stylexjs\//],
    onlyBundle: false,
  },
  plugins: [
    stylexPlugin({
      fileName: 'styles.partial.css',
      useCSSLayers: true,
      lightningcssOptions: { targets: mosaicLightningCssTargets },
    }),
  ],
  onSuccess: async () => {
    const { rm } = await import('node:fs/promises');
    await rm('./dist/index.js.map', { force: true });
  },
});
