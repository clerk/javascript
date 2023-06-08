# Publishing packages

_Note: Only core maintainers can publish packages._

_Package versioning and publishing is currently handled by @clerkinc/frontend-team._

## Publishing stable package versions

### TL;DR

1. `npm run bump`
2. `npm run release`

### Commands explanation

After all the features have been merged and we want to create a new release, we use `npm run bump`.

This script will use `lerna version` to check which packages need to be updated and in what way based on the updates since the previous release.

The command will guide you through the version changes that are detected and will:

- Bump the package versions.
- Run the `version` hook updating the version info files.
- Create new tags and a "release" commit.
- Push the commit and tags to the origin.

After that is done, and all seems valid, you can run `npm run release` which will go through the publish process of the packages included in the release commit.

For more info you can check the [lerna version](https://github.com/lerna/lerna/tree/main/commands/version) and [lerna publish](https://github.com/lerna/lerna/tree/main/commands/publish) documentation.

## Publishing `@staging` package versions

_`@staging` version updates and publishing is managed using Lerna._

Install the `@staging` version using `npm install @clerk/{package_name}@staging`.

TODO

## Publishing `@next` package versions

_`@next` version updates and publishing is managed using Lerna._

Install the `@next` version using `npm install @clerk/{package_name}@next`.

### TL;DR

1. `npm run bump:next`
2. `npm run release:next`

### Graduate the next version

To graduate\* the version pointed by the `@next` tag:

1. `npm run graduate:next`
2. `npm run release`

### Process explanation

The `bump:next` command will create an `alpha` version update on the packages changed. Next if you want to release this version on npm to be installed, you would run the `npm run release:next` which would publish the version under the `@next` tag.

\* By 'graduate' we mean publishing the `@next` tagged versions, which in actual versions result in `x.y.z-alpha.a.b.c`, to the stable one `x.y.z`.
