# Build, ESLint & distribution

StyleX is a compiler. It transforms `stylex.*` calls into atomic classes +
`defineVars` into custom properties and extracts everything to one static `.css`.
The only runtime is a tiny `stylex.props()` class-joiner.

## Build wiring (the POC, verified)

The Clerk POC compiles `src/mosaic-x` with the StyleX **rollup** plugin inside the
existing `tsdown` (rolldown) build, isolated from the Emotion build so nothing
else is touched:

```ts
// tsdown.mosaic-x.config.mts
import stylexPlugin from '@stylexjs/rollup-plugin';
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/mosaic-x/index.ts'],
  outDir: './dist-mosaic-x',
  format: ['esm'],
  dts: true,
  clean: true,
  platform: 'browser',
  tsconfig: './tsconfig.mosaic-x.json', // jsxImportSource back to 'react' (Emotion-free)
  external: ['react', 'react-dom', '@stylexjs/stylex'],
  plugins: [stylexPlugin({ fileName: 'mosaic.css', useCSSLayers: true })],
});
```

- The rollup plugin bundles its own TS/JSX Babel syntax plugins — no
  `@babel/preset-*` needed on this path. The oxc/tsdown pass strips types and
  lowers JSX; the StyleX plugin transforms the `stylex.*` calls.
- Output: `dist-mosaic-x/{index.js, index.d.ts, mosaic.css}`.
- Deps: `@stylexjs/stylex` (dependency), `@stylexjs/rollup-plugin` (devDependency).
- **`jsxImportSource` matters** — the `@clerk/ui` package defaults JSX to
  `@emotion/react`. mosaic-x overrides it back to `react` in its own tsconfig so
  the output is genuinely Emotion-free.

Run it: `cd packages/ui && pnpm build:mosaic-x`, then open
`src/mosaic-x/demo.html` for the override proof.

## Key StyleX compiler options (astryx's babel config)

If a Babel-based pipeline is used instead of the rollup plugin, these are the
options that matter (from astryx `packages/core/babel.config.json`):

```jsonc
[
  "@stylexjs/babel-plugin",
  {
    "dev": false, // production: no dev runtime / readable-name overhead
    "runtimeInjection": false, // styles extracted to CSS at build, not injected at runtime
    "genConditionalClasses": true, // REQUIRED for stylex.when.* (markers / relational)
    "treeshakeCompensation": true, // re-adds styles a tree-shake would wrongly drop
    "unstable_moduleResolution": { "type": "commonJS", "rootDir": "." },
  },
]
```

- `genConditionalClasses: true` — without it, markers/`stylex.when` don't compile.
- `treeshakeCompensation: true` — pair with `sideEffects` in package.json.
- `dev: true` in local dev gives readable, debuggable class names.

## Cascade layers

Keep **`useCSSLayers: true`**. StyleX wraps its atomic rules in
`@layer priority1, priority2, …` for correct intra-StyleX precedence. Those nest
under whatever outer layer the consumer imports our sheet into — see
`overrides.md`. We do **not** engineer consumer override precedence; layers make
it the consumer's job (`@import '@clerk/ui/mosaic.css' layer(components)`).

For a global reset, mirror astryx's layer order: `reset` → `<ns>-base` →
`<ns>-theme`, with unlayered consumer styles always winning. Keep the reset in the
lowest-priority layer.

## ESLint — enforce tokens & valid styles

Two layers of linting:

1. **`@stylexjs/eslint-plugin`** — the official rules:
   - `valid-styles` — catches invalid style objects (top-level pseudos, bad values).
   - `no-unused` — flags dead style namespaces.
   - `valid-shorthands` — warns on multi-value shorthands.
   - `sort-keys` — deterministic key order.
2. **A repo rule enforcing token usage** (astryx ships an internal
   `no-hardcoded-styles` rule): reject literal `color`/`backgroundColor`,
   `padding`/`margin`, `borderRadius`, `fontSize`/`fontWeight`/`lineHeight` values
   and require the matching `--cl-*` token. Run as warnings locally, errors in CI.

The POC also adds a lint rule keeping the stable class (`'cl-button'`) a literal —
it's a public contract, not a derived identifier.

## Distribution model

**Precompiled (the model for Clerk).** We run StyleX at _our_ build and publish
transformed JS + a static `mosaic.css`. Consumers import components normally and
import the stylesheet once into a layer they control. **Zero StyleX config
downstream.** This fits how `@clerk/ui` is consumed (framework SDKs + injected
into clerk-js).

Source distribution (shipping `.stylex.ts` and requiring every consumer to run the
StyleX plugin) is **not viable** — consumers are arbitrary Next/Vite/etc. apps we
don't control.

### Open build questions (from the migration spike)

- **clerk-js load path.** clerk-js is a runtime-injected rspack UMD bundle, not an
  npm import. A static `mosaic.css` needs an explicit load/inject path there
  (today Mosaic styles are runtime-injected by Emotion). Biggest unknown.
- **Double atomization.** A consumer that also uses StyleX won't dedupe against our
  precompiled atoms (two outputs). Harmless with layers, slightly larger CSS —
  document it.
- **Migration coexistence.** During the window, Emotion Mosaic and StyleX Mosaic
  share the DOM; reconcile the reset (`:where([data-cl-slot])`) and layer order so
  neither stomps the other.
