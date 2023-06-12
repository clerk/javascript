# CICD

## TLDR (day-to-day dev flow)

Every time a PR is merged into `main`, an automated staging release will happen. Once the packages are pushed to `npm`, the following actions will take place:

- The staging `clerkjs-proxy` worker will start serving the most recent `@staging` version of `@clerk/clerk-js`, completely bypassing any Cloudflare and JSDeliver edge caches.
- The staging Accounts project will be deployed using the most recent `@staging` version of `@clerk/nextjs`.

## Stable releases

A stable release will be triggered every time the "Version Packages" PR is merged. Once versioning and publishing is done, the `clerkinc/javascript` repo will dispatch a workflow event, notifying other related Clerk repos of the new releases.

Actions that will be triggered:

- `clerkinc/cloudflare-workers`: The latest clerk-js versions in `clerkjs-proxy/wrangler.toml` will be updated a PR will open. Follow the instructions in the PR to manually release a new `clerkjs-proxy` worker.

For more details, refer to [PUBLISH.md](https://github.com/clerkinc/javascript/blob/main/docs/PUBLISH.md).

## Automated staging releases

A staging release will be triggered every time PR is merged into `main`. Once versioning and publishing is done, the `clerkinc/javascript` repo will dispatch a workflow event, notifying other related Clerk repos of the new releases.

Actions that will be triggered:

- `clerkinc/cloudflare-workers`: The latest clerk-js versions in `clerkjs-proxy/wrangler.toml` will be updated and directly committed to `main`. A second workflow will perform a staging release of the `clerkjs-proxy` worker.
- `clerkinc/accounts`: A new Accounts deployment will take place, using the most recent staging `@clerk/nextjs` version. This change will not be committed to `main`.

For more details about staging releases, refer to [PUBLISH.md](https://github.com/clerkinc/javascript/blob/main/docs/PUBLISH.md).

## Quality checks

Every time a PR opens or a PR is merged into `main`, the workflows defined in `.github/workflows` will run, ensuring:

- all packages build correctly using Node@18 and Node@19
- all tests pass using Node@18 and Node@19
- no type issues exist using `TSC`
- no lint issues exist
- formatting is consistent

## Misc

- The `labeler` workflow automatically adds tags to all PRs according to the packages they affect
- The `lock-threads` workflow runs on a schedule and automatically locks stale PRs and Issues.
