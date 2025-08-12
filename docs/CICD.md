# Continuous Integration / Continuous Delivery (CI/CD)

## Day-to-day workflow

Every time a PR is merged into `main`, an automated canary release will happen. Once the packages are pushed to `npm`, the following actions will take place:

- The canary `clerkjs-proxy` worker will start serving the most recent `@canary` version of `@clerk/clerk-js`, completely bypassing any Cloudflare and JSDeliver edge caches.
- The canary Accounts project will be deployed using the most recent `@canary` version of `@clerk/nextjs`.

## Stable releases

A stable release will be triggered every time the "ci(repo): Version packages" PR is merged. Once the PR is merged, the following actions will take place:

- All SDKs will be published to `npm`, except for those found in the excluded packages list in `.changeset/config.json`, or any packages with `private: true` set in their `package.json` file.
- A workflow dispatch will be triggered to update the `clerkjs-proxy` worker in `clerk/sdk-infra-workers`.
- A workflow dispatch will be triggered to update the `@clerk/nextjs` version in `clerk/dashboard`.
- A workflow dispatch will be triggered to update the typedoc generated docs in `clerk/clerk-docs`.

For details regarding the package versioning/publishing process, refer to the [Publishing docs](https://github.com/clerk/javascript/blob/main/docs/PUBLISH.md).

Refer to the docs in the (private) `clerk/sdk-infra-workers` repo for more details about the `clerkjs-proxy` worker release process.

## Automated canary releases

A canary release will be triggered every time PR is merged into `main`. Every commit merged into main will trigger the following actions:

- A workflow dispatch will be triggered to update the `clerkjs-proxy` worker in `clerk/sdk-infra-workers`.
- The canary Accounts project will be deployed using the most recent `@canary` version of `@clerk/nextjs`. This happens for testing purposes.

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
