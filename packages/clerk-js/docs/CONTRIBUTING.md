# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.
Please note we have a [code of conduct](CODE_OF_CONDUCT.md), please follow it in all your interactions with the project.

<details open="open">
<summary><strong>TABLE OF CONTENTS</strong></summary>

- [Development environment setup](#development-environment-setup)
- [Issues and feature requests](#issues-and-feature-requests)
  - [How to submit a Pull Request](#how-to-submit-a-pull-request)
- [Publishing packages](#publishing-packages)
  - [Publishing `@next` package versions](#publishing-next-package-versions)
- [License](#license)

</details>

## Development environment setup

The current monorepo setup is based on:

- [Lerna](https://github.com/lerna/lerna) used mostly for task running and versioning.
- [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) used for package linking.

### A note on commit messages

The processes required for Lerna to manage releases and changelogs is done through the [conventional-commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

To set up your development environment, please follow these steps:

1. Clone the repo

   ```sh
   git clone https://github.com/clerkinc/javascript
   ```

2. Change into the directory and install dependencies

   ```sh
   cd javascript
   npm install
   ```

3. Build all the packages in the monorepo by running:

   ```sh
   npm run build
   ```

## Issues and feature requests

You've found a bug in the source code, a mistake in the documentation or maybe you'd like a new feature? You can help us by [submitting an issue on GitHub](https://github.com/clerkinc/javascript/issues). Before you create an issue, make sure to search the issue archive -- your issue may have already been addressed!

Please try to create bug reports that are:

- _Reproducible._ Include steps to reproduce the problem.
- _Specific._ Include as much detail as possible: which version, what environment, etc.
- _Unique._ Do not duplicate existing opened issues.
- _Scoped to a Single Bug._ One bug per report.

**Even better: Submit a pull request with a fix or new feature!**

### How to submit a Pull Request

1. Search our repository for open or closed
   [Pull Requests](https://github.com/clerkinc/javascript/pulls)
   that relate to your submission. You don't want to duplicate effort.
2. Fork the project
3. Create your feature branch (`git checkout -b feat/amazing_feature`)
4. Commit your changes (`git commit -m 'feat: Add amazing_feature'`). Clerk uses [conventional commits](https://www.conventionalcommits.org), so please follow the specification in your commit messages.
5. Push to the branch (`git push origin feat/amazing_feature`)
6. [Open a Pull Request](https://github.com/clerkinc/javascript/compare?expand=1)

## Publishing packages

_Version updates and publishing is managed using Lerna._

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

## License

By contributing to Clerk, you agree that your contributions will be licensed under its MIT License.
