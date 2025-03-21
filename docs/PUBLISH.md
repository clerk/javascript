# Publishing packages

_Note: Only Clerk employees can trigger the actions described below._

## Publishing stable package versions (`@latest`)

We are using [changesets](https://github.com/changesets/changesets), so our CICD is using [`changesets/action`](https://github.com/changesets/action) to automate the release process when releasing stable package versions targeting the `@latest` tag.

**Important:** In order to merge PRs that include changesets with **major** version bumps, you need to comment `!allow-major` in the PR. This is to ensure that major version bumps are intentional and not accidental. **Note:** Ensure that your Clerk organization membership status is set to "Public". To set your status to "Public", follow [these steps](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-your-membership-in-organizations/publicizing-or-hiding-organization-membership).

Every time a PR is merged into `main`, the changesets action parses all changesets found in `.changeset` and updates the "ci(repo): Version packages" PR with the new package versions and the changelog for the next stable release.

To release a new stable version of all Clerk packages, find the "ci(repo): Version packages" PR, verify the changes, and merge it.

## Publishing canary package versions (`@canary`)

An automated canary release will be take place every time a PR gets merged into `main`.

- Staging versions use the following format: `@clerk/package@x.y.z-canary.commit`, where `package` is the package name, `x`,`y`,`z` are the major, minor and patch versions respectively, `canary` is a stable prerelease name and `commit` is the id of the last commit in the branch.
- Currently, canary version changes are _not_ committed to the repo and no git tags will be generated. Using this strategy, we avoid merge conflicts, allowing us to constantly deploy canary versions without switching the repo to a "prerelease" mode.
- During a canary release, `@clerk/clerk-js` will also be released. If needed, use the `clerkJSVersion` prop to use a specific version, eg: `<ClerkProvider clerkJSVersion='4.1.1-canary.90012' />`
- A package will not be published if it's not affected by a changeset.

**Note:** If the `main` branch is in [prerelease mode](https://github.com/changesets/changesets/blob/main/docs/prereleases.md) merges into the latest `release/` branch will be released under the `@canary` tag.

## Publishing snapshot package versions (`@snapshot`)

Snapshot releases are a way to release your changes for testing without updating the versions or waiting for your PR to be merged into `main`. This is especially useful when you want to test your changes in a cloud environment that does not offer a way to upload prebuilt artifacts of your app or if you want to test the end-to-end flow as a user, without relying on local linking to test. Snapshot releases can also be used as a tool for customers to verify a fix on their machines.

**Important:** Before requesting a snapshot release, ensure that your Clerk organization membership status is set to "Public". Otherwise, the snapshot release will fail. To set your status to "Public", follow [these steps](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-your-membership-in-organizations/publicizing-or-hiding-organization-membership).

**Important:** When using a snapshot release, it's highly recommended you install a specific version directly (eg `npm i @clerk/nextjs@4.27.0-snapshot.v609cd23`). Do not use the `@snapshot` tag to get the most recent snapshot release, as this will result in unexpected behavior when another member publishes their own snapshot.

To perform a snapshot release, simply comment `!snapshot` in your PR. Once the packages are built and published (~2mins), [clerk-cookie](https://github.com/clerk-cookie) will post a reply with the published versions ([example](https://github.com/clerk/javascript/pull/1329#issuecomment-1586970784)). Simply install the snap version using `npm install` as usual.

Notes:

- Snapshot versions use the following format: `@clerk/package@x.y.z-snapshot.commit`, where `package` is the package name, `x`,`y`,`z` are the major, minor and patch versions respectively, `snapshot` is a stable prerelease name and `commit` is the id of the last commit in the branch.
- If you want to name your snapshot release, you can pass an argument to the snapshot comment, eg `!snapshot myname` will use `myname` instead of `snapshot`, eg: `@clerk/clerk-js@4.1.1-myname.90012`. Please note: When using a custom name, the underlying id stays the same and only the tag changes. This has the consequence that npm resolves versions alphabetically. You should pin your versions and not rely on resolving through `^` or `~`.
- Snapshot version changes are _not_ committed to the repo and no git tags will be generated - they are meant to be used as "snapshots" of the repo at a particular state for testing purposes.
- During a snapshot release, `@clerk/clerk-js` will also be released. If needed, use the `clerkJSVersion` prop to use a specific version, eg: `<ClerkProvider clerkJSVersion='4.1.1-snapshot.90012' />`
- To make iterations faster, tests will not run for snapshot versions.
- A package will not be published if it's not affected by a changeset.

## Backporting PRs

> Backporting is the action of taking parts from a newer version of a software system or software component and porting them to an older version of the same software.

If a PR got merged into `main` that should also be released in older versions (e.g. critical security fixes), you'll need to backport said PR. You can do this by using the [`backport` script](https://github.com/clerk/javascript/blob/main/scripts/backport.mjs) inside `scripts`.

Duplicate the `.env.example` file inside `scripts` and rename it to `.env`. Fill out the `GITHUB_ACCESS_TOKEN` variable. Afterwards, you'll be able to run the CLI like so:

```shell
node backport.mjs release/v4 1234
```

The command above will backport the PR `1234` to the branch `release/v4`.

## Previewing PRs

Deploy previews enable you to give yourself and others reviewing the PR a chance to see your changes deployed in a live environment. Your changes are applied to a test site and deployed to a URL one can visit. This is especially helpful for e.g. visual changes made inside the UI components.

**Important:** Before requesting a deploy preview, ensure that your Clerk organization membership status is set to "Public". Otherwise, the preview will fail. To set your status to "Public", follow [these steps](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-your-membership-in-organizations/publicizing-or-hiding-organization-membership).

You can request a deploy preview by commenting `!preview` in your PR. A GitHub workflow will take your current PR, install the current state of the packages into a test site, and deploy that test site to Vercel. Once the deployment is done, a GitHub comment will point you to the deployed URL.

**Important:** In order for you (or others) to visit the preview URL, you’ll need to be part of the Clerk Vercel team and logged into Vercel.
