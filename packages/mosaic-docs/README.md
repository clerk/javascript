# @clerk/mosaic-docs

Private Next.js docs site for Mosaic (`@clerk/mosaic`), served from the root of `mosaic.clerk.com`.

```sh
pnpm --filter @clerk/mosaic-docs dev   # http://localhost:6021
```

Content is generated, not written by hand. `scripts/generate.mts` runs before `dev` and `build`. It reads swingset's stories and MDX in `../swingset/src/stories` and writes JSON to the git-ignored `.content/`. Only the Components, Primitives and Hooks groups are included. To change a page, edit its swingset MDX or story.
