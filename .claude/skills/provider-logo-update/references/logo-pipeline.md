# Provider logo pipeline

Shared by `provider-logo-update` and `provider-logo-add`.

## Where things live

All paths are under `packages/mosaic/`.

| Path                                                     | What                                                                              |
| -------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/components/provider-logo/logos/<id>.svg`            | Source SVG per provider, as downloaded from the brand (hand-trimmed if needed)    |
| `src/components/provider-logo/logos/manifest.json`       | Source of truth: order, treatment, color swaps, brand URL, provenance, last check |
| `scripts/generate-provider-logos.mjs`                    | svgo + treatment + JSX codegen                                                    |
| `src/components/provider-logo/glyphs/<id>.generated.tsx` | Generated glyph module per logo                                                   |
| `src/components/provider-logo/<group>.generated.ts`      | Generated map and lookup per group (`oauth`, `enterprise`, `web3`, `phone`)       |

Never hand-edit a `*.generated.*` file. Edit the SVG or manifest, then run
`pnpm --filter @clerk/mosaic generate:provider-logos`.

## Manifest entry

```json
{
  "id": "atlassian",
  "name": "Atlassian",
  "treatment": "adaptive",
  "groups": { "oauth": ["atlassian"] },
  "colors": { "#1868db": "light-dark(#1868DB, #357DE8)" },
  "brand": "https://atlassian.design/foundations/logos",
  "source": "Paths and colors from @atlaskit/logo.",
  "checked": "2026-10-02"
}
```

- `id` names the logo: the SVG filename and the glyph module. Use the Clerk provider id when the
  logo belongs to one (`provider` in `packages/shared/src/oauth.ts` or `web3.ts`, `channel` in
  `alternativePhoneCode.ts`).
- `groups` lists, per group, the ids a lookup in that group resolves to this logo. Keys are the ids
  Clerk uses in that context: OAuth and Web3 providers, phone code channels, and full enterprise
  provider ids (`saml_okta`, `oauth_google`, `oidc_gitlab`). A logo in several groups (Google is
  `oauth` and `enterprise`) is one module that each group map references.
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
   that imports its group carries it.
2. `pnpm --filter @clerk/mosaic exec vitest run --project mosaic src/components/provider-logo`.
3. Look at swingset `/components/provider-logo`: the Color schemes example shows every logo on
   light and dark. Check the changed logo at `sm`, `md`, and `lg` against its neighbors. Swingset
   runs on 6006 (`pnpm run dev:swingset`); use another port if a second worktree holds it. Ask the
   user before driving a browser for screenshots.

## Bundle size

`ProviderLogo` renders whatever glyph it is handed, so it pulls in no logos itself. A feature pays
only for the group maps it imports. Minified and gzipped: `oauth` ~6.3KB, `enterprise` ~1.6KB,
`web3` ~1.5KB, `phone` ~0.6KB. `enterprise` shares Google, Microsoft, GitHub and GitLab with
`oauth`, so a bundle with both adds only Okta.

Loading only the logo a screen needs after discovering which one it is was rejected: the extra round
trip costs more than the bytes it saves. The group modules are the unit for the planned
per-feature code splitting, so a split chunk carries only the groups its feature imports.

## Changeset

Follow `AGENTS.md`. If `ProviderLogo` is reachable from a published entry point
(`packages/mosaic/src/index.ts`, directly or through an exported feature), write a
`@clerk/mosaic` changeset describing the visible change ("Updated the Linear logo to the current
mark"). Otherwise use `pnpm changeset:empty`.
