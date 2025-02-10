# Continuous Integration / Continuous Delivery (CI/CD)

## Day-to-day workflow

Every time a PR is merged into `main`, an automated canary release will happen. Once the packages are pushed to `npm`, the following actions will take place:

- The canary `clerkjs-proxy` worker will start serving the most recent `@canary` version of `@clerk/clerk-js`, completely bypassing any Cloudflare and JSDeliver edge caches.
- The canary Accounts project will be deployed using the most recent `@canary` version of `@clerk/nextjs`.

## Stable releases

A stable release will be triggered every time the "ci(repo): Version packages" PR is merged. Once versioning and publishing is done, the `clerk/javascript` repo will dispatch a workflow event, notifying other related Clerk repos of the new releases.

Actions that will be triggered:

- `clerk/cloudflare-workers`: The latest clerk-js versions in `clerkjs-proxy/wrangler.toml` will be updated a PR will open. Follow the instructions in the PR to manually release a new `clerkjs-proxy` worker.

For more details, refer to the [Publishing docs](https://github.com/clerk/javascript/blob/main/docs/PUBLISH.md).

## Automated canary releases

A canary release will be triggered every time PR is merged into `main`. Once versioning and publishing is done, the `clerk/javascript` repo will dispatch a workflow event, notifying other related Clerk repos of the new releases.

Actions that will be triggered:

- `clerk/cloudflare-workers`: The latest clerk-js versions in `clerkjs-proxy/wrangler.toml` will be updated and directly committed to `main`. A second workflow will perform a canary release of the `clerkjs-proxy` worker.
- `clerk/accounts`: A new Accounts deployment will take place, using the most recent canary `@clerk/nextjs` version. This change will not be committed to `main`.

For more details about canary releases, refer to the [Publishing docs](https://github.com/clerk/javascript/blob/main/docs/PUBLISH.md).

## Quality checks

Every time a PR opens or a PR is merged into `main`, the workflows defined in `.github/workflows` will run, ensuring:

- all packages build correctly
- all unit and integration tests are passing
- no type issues exist using `tsc`
- no lint issues exist
- formatting is consistent

## Miscellaneous

- The `labeler` workflow automatically adds tags to all PRs according to the packages they affect
- The `lock-threads` workflow runs on a schedule and automatically locks stale PRs and issues
