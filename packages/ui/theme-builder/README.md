## Theme Builder

One-time setup in `packages/ui/theme-builder`:

- `vercel link`
- `vercel pull`

To deploy:

- ensure packages are built, from repo root: `npx turbo build`
- `cd packages/ui/theme-builder`
- `vercel build`
- `vercel deploy --prebuilt --prod`
