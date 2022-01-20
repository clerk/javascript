# Publishing packages

_Version updates and publishing is managed using Lerna._

## TLDR
1. `npm run bump`
2. `npm run release`

## Commands explanation

After all the features have been merged and we want to create a new release, we use `npm run bump`.

This script will use `lerna version` to check which packages need to be updated and in what way based on the updates since the previous release.

The command will guide you through the version changes that are detected and will:
- Bump the package versions.
- Run the `version` hook updating the version info files.
- Create new tags and a "release" commit.
- Push the commit and tags to the origin.

After that is done, and all seems valid, you can run `npm run release` which will go through the publish process of the packages included in the release commit. 

\*For more info you can check the [lerna version](https://github.com/lerna/lerna/tree/main/commands/version) and [lerna publish](https://github.com/lerna/lerna/tree/main/commands/publish) documentation.