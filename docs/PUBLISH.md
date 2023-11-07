# Publishing packages

_Note: Only core maintainers can publish packages._

_Package versioning and publishing is currently handled by @clerk/frontend-team._

## Publishing stable package versions (`@latest`)

We are using [changesets](https://github.com/changesets/changesets), so our CICD is using [`changesets/action`](https://github.com/changesets/action) to automate the release process when releasing stable package versions targeting the `@latest` tag.

Every time a PR is merged into `main`, the changesets action parses all changesets found in `.changeset` and updates the "Version Packages" PR with the new package versions and the changelog for the next stable release.

To release a new stable version of all Clerk packages, find the "Version Packages" PR, verify the changes, and merge it.

## Publishing canary package versions (`@canary`)

An automated canary release will be take place every time a PR gets merged into `main`.

- Canary versions use the following format: `@clerk/package@x.y.z-canary.commit`, where `package` is the package name, `x`,`y`,`z` are the major, minor and patch versions respectively, `canary` is a stable prerelease mame and `commit` is the id of the last commit in the branch.
- Currently, canary version changes are _not_ committed to the repo and no git tags will be generated. Using this strategy, we avoid merge conflicts, allowing us to constantly deploy canary versions without switching the repo to a "prerelease" mode.
- During a canary release, `@clerk/clerk-js` will also be released. If needed, use the `clerkJSVersion` prop to use a specific version, eg: `<ClerkProvider clerkJSVersion='4.1.1-canary.90012' />`
- A package will not be published if it's not affected by a changeset.

## Publishing snapshot package versions (`@snapshot`)

Snapshot releases are a way to release your changes for testing without updating the versions or waiting for your PR to be merged into `main`. This is especially useful when you want to test your changes in a cloud environment that does not offer a way to upload prebuilt artifacts of your app or if you want to test the end-to-end flow as a user, without relying on local linking to test. Snapshot releases can also be used as a tool for customers to verify a fix on their machines.

**Important:**
Before requesting a snapshot release, ensure that your Clerk organization membership status is set to "Public". Otherwise, the snapshot release will fail. To set your status to "Public", follow [these steps](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-your-membership-in-organizations/publicizing-or-hiding-organization-membership).

To perform a snapshot release, simply comment `!snapshot` in your PR. Once the packages are built and published (~2mins), [clerk-cookie](https://github.com/clerk-cookie) will post a reply with the published versions ([example](https://github.com/clerk/javascript/pull/1329#issuecomment-1586970784)). Simply install the snap version using `npm install` as usual.

Notes:

- Snapshot versions use the following format: `@clerk/package@x.y.z-snapshot.commit`, where `package` is the package name, `x`,`y`,`z` are the major, minor and patch versions respectively, `snapshot` is a stable prerelease mame and `commit` is the id of the last commit in the branch.
- If you want to name your snapshot release, you can pass an argument to the snapshot comment, eg `!snapshot myname` will use `myname` instead of `snapshot`, eg: `@clerk/clerk-js@4.1.1-myname.90012`. Please note: When using a custom name, the underlying id stays the same and only the tag changes. This has the consequence that npm resolves versions alphabetically. You should pin your versions and not rely on resolving through `^` or `~`.
- Snapshot version changes are _not_ committed to the repo and no git tags will be generated - they are meant to be used as "snapshots" of the repo at a particular state for testing purposes.
- During a snapshot release, `@clerk/clerk-js` will also be released. If needed, use the `clerkJSVersion` prop to use a specific version, eg: `<ClerkProvider clerkJSVersion='4.1.1-snapshot.90012' />`
- To make iterations faster, tests will not run for snapshot versions.
- A package will not be published if it's not affected by a changeset.

## Publishing canary package versions (`@canary`)

We're still considering whether switching the repo into a `canary` mode for big, experimental features makes sense. There is no use case for this right now, however, we might experiment with the [changesets prerelease mode](https://github.com/changesets/changesets/blob/main/docs/prereleases.md) in the future.
