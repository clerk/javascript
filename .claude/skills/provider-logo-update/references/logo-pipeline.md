# Provider logo pipeline

Shared by `provider-logo-update` and `provider-logo-add`.

## Where things live

All paths are under `packages/mosaic/`.

| Path                                                              | What                                                                              |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/components/provider-logo/logos/<id>.svg`                     | Source SVG per provider, as downloaded from the brand (hand-trimmed if needed)    |
| `src/components/provider-logo/logos/manifest.json`                | Source of truth: order, treatment, color swaps, brand URL, provenance, last check |
| `scripts/generate-provider-logos.mjs`                             | svgo + treatment + JSX codegen                                                    |
| `src/components/provider-logo/provider-logo.ids.generated.ts`     | Generated id list and `ProviderLogoId`                                            |
| `src/components/provider-logo/provider-logo.glyphs.generated.tsx` | Generated glyphs, imported statically by `ProviderLogo`                           |

Never hand-edit a `*.generated.*` file. Edit the SVG or manifest, then run
`pnpm --filter @clerk/mosaic generate:provider-logos`.

## Manifest entry

```json
{
  "id": "atlassian",
  "name": "Atlassian",
  "treatment": "adaptive",
  "colors": { "#1868db": "light-dark(#1868DB, #357DE8)" },
  "brand": "https://atlassian.design/foundations/logos",
  "source": "Paths and colors from @atlaskit/logo.",
  "checked": "2026-10-02"
}
```

- `id` is the Clerk provider id (`provider` in `packages/shared/src/oauth.ts`, `web3.ts`, or
  `channel` in `alternativePhoneCode.ts`), and the SVG filename.
- `colors` maps a fill **as svgo writes it** (lowercase, shortened hex: `#000`, `#00f`) to its
  replacement. The generator throws if a key is not found; its error prints the optimized markup.
- `brand` is the official brand or sign-in-button guideline page. Omit it only when none exists.
- `source` records anything non-obvious about where the asset came from or why it deviates.
- `checked` is the date the entry was last compared against the brand (ISO `YYYY-MM-DD`).

## Choosing a treatment

| Treatment  | Use when                                                                            | Effect                                 |
| ---------- | ----------------------------------------------------------------------------------- | -------------------------------------- |
| `color`    | A full-color mark the brand uses on both light and dark backgrounds                 | Rendered as-is                         |
| `mono`     | The brand's mark is black/white only, or its login button uses a one-color mark     | Every fill becomes `currentColor`      |
| `adaptive` | The brand names different colors for dark backgrounds, or forbids its color on dark | Listed fills become `light-dark(a, b)` |

Precedence: the brand's sign-in-button guideline beats its general logo page, which beats the
press kit. Apple must resolve to pure black or white (App Review checks custom buttons), so it is
`adaptive` with `light-dark(#000, #fff)`, not `mono`.

The dark Mosaic background is `oklch(0.2046 0 0)`. If a `color` mark is near-invisible there and
the brand allows a white version, make it `adaptive`.

## Sourcing an asset

1. Open the manifest `brand` URL (WebFetch, or a browser for JS-rendered pages). Look for the
   **symbol/icon mark**, not the wordmark, unless the brand has no symbol (Box).
2. Prefer a direct official SVG. Zips are common: download and unzip in the scratchpad.
3. Fallbacks, in order: the brand's own npm package (`@atlaskit/logo`), its developer docs' login
   button kit, then [simple-icons](https://simpleicons.org) (CC0, one-color marks only). Record
   the fallback in `source`.
4. Never redraw, recolor beyond the brand's own palette, or trace a raster. If only PNG exists,
   stop and report it.

Pages that commonly block fetching: X (402), Coinbase (403), Meta brand zips, Okta (partner
login), HubSpot (Brandfolder form), Notion (redirects to app login). Report these rather than
guessing.

## Cleaning an SVG

The generator throws on `<image>`, `<style>`, `<script>`, `<foreignObject>`, and text content.

- **Figma exports:** check fills are real colors. A `fill="{&quot;type&quot;:&quot;GRADIENT_…`
  value renders as nothing (this is how the old Instagram asset broke).
- **Background tiles:** remove full-bleed background rects the brand does not include (the old
  Microsoft asset had a `#F3F3F3` square that showed as a gray box in dark mode).
- **viewBox:** keep it. Non-square boxes are centered into a square automatically. Trim excess
  padding so the mark's optical size matches its neighbors.
- **Gradients and clip paths** are fine; ids are scoped per instance by the generator.

## Verifying

1. `pnpm --filter @clerk/mosaic generate:provider-logos`. It prints the gzip size of all logos;
   note the before/after. A single logo over ~1.5KB gzip deserves a second look, since every bundle
   that imports `ProviderLogo` carries every logo.
2. `pnpm --filter @clerk/mosaic exec vitest run --project mosaic src/components/provider-logo`.
3. Look at swingset `/components/provider-logo`: the Color schemes example shows every logo on
   light and dark. Check the changed logo at `sm`, `md`, and `lg` against its neighbors. Swingset
   runs on 6006 (`pnpm run dev:swingset`); use another port if a second worktree holds it. Ask the
   user before driving a browser for screenshots.

## Bundle size

`ProviderLogo` imports every glyph statically. With 37 logos that is ~22.5KB minified / ~7.9KB
gzip, carried by whichever bundle imports `ProviderLogo`, whether or not the screen shows a logo.

### Lazy loading later

Moving the glyphs into a lazy chunk would take that ~7.9KB gzip out of the eager bundle for apps and
screens that never show a provider logo (no social or enterprise sign-in, `UserButton`-only). It
costs one round trip and an empty first frame unless the chunk is preloaded. Approaches:

1. **One lazy chunk (built and verified in the first commit of PR #10044).** A module-level loader
   `import()`s `provider-logo.glyphs.generated`, and `useSyncExternalStore` re-renders every
   `ProviderLogo` when it resolves. The `<svg>` keeps its size with no `viewBox` until then, so
   nothing shifts. Export a `preloadProviderLogos()` and call it once the environment shows social
   or enterprise sign-in is enabled (sign-in/up), or when the `UserButton` menu opens (profile).
   tsdown emits the chunk as its own file, and a consumer's bundler makes it its own async chunk.
2. **One module per logo.** Generate a module per provider and `import()` by id, so a screen fetches
   only the logos it shows. Smallest transfer, but one request per logo and more codegen; worth it
   only if the set grows well past its current size.
3. **Stay eager, trim outliers.** Hugging Face alone is ~1.5KB of the ~7.9KB gzip. Simplifying or
   lazy-loading only the heaviest marks keeps the API synchronous.

## Changeset

Follow `AGENTS.md`. If `ProviderLogo` is reachable from a published entry point
(`packages/mosaic/src/index.ts`, directly or through an exported feature), write a
`@clerk/mosaic` changeset describing the visible change ("Updated the Linear logo to the current
mark"). Otherwise use `pnpm changeset:empty`.
