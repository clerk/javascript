# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.
Please note we have a [code of conduct](https://github.com/clerkinc/javascript/blob/main/docs/CODE_OF_CONDUCT.md), please follow it in all your interactions with the project.

<details open="open">
<summary><strong>TABLE OF CONTENTS</strong></summary>

- [Development environment setup](#development-environment-setup)
- [Issues and feature requests](#issues-and-feature-requests)
- [Commit messages](#commit-messages)
- [Pull Requests](#pull-requests)
  - [Notes on Pull Requests](#notes-on-pull-requests)
- [Publishing packages](#publishing-packages)
- [License](#license)

</details>

## Development environment setup

The current monorepo setup is based on:

- [Lerna](https://github.com/lerna/lerna) used mostly for task running and versioning.
- [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) used for package linking.

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

For package specific setup, refer to the `Build` section of the specific package (eg packages/<package_name>/README.md#build).

## Issues and feature requests

You've found a bug in the source code, a mistake in the documentation or maybe you'd like a new feature? You can help us by [submitting an issue on GitHub](https://github.com/clerkinc/javascript/issues). Before you create an issue, make sure to search the issue archive -- your issue may have already been addressed!

Please try to create bug reports that are:

- _Reproducible._ Include steps to reproduce the problem.
- _Specific._ Include as much detail as possible: which version, what environment, etc.
- _Unique._ Do not duplicate existing opened issues.
- _Scoped to a Single Bug._ One bug per report.

**Even better: Submit a pull request with a fix or new feature!**

## Commit messages

The processes required for Lerna to manage releases and changelogs is done through the [conventional-commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

Use of `scope` in commit message is **mandatory** and the allowed values are:

- the package names of the monorepo defined in `packages/{package}/package.json`
- `repo` for repository level changes
- `release` for releases

## Pull Requests

1. Search our repository for open or closed
   [Pull Requests](https://github.com/clerkinc/javascript/pulls)
   that relate to your submission. You don't want to duplicate effort.
2. Fork the project
3. Create your feature branch (`git checkout -b feat/amazing_feature`)
4. Commit your changes (`git commit -m 'feat: Add amazing_feature'`). Clerk uses [conventional commits](https://www.conventionalcommits.org), so please follow the specification in your commit messages.
5. Push to the branch (`git push origin feat/amazing_feature`)
6. [Open a Pull Request](https://github.com/clerkinc/javascript/compare?expand=1)
7. Follow the instructions of the pull request template

### Notes on Pull Requests

- Prefer multiple small PRs with related changes (easier to review and provide feedback)
- Always add description in PRs (describe high level the issue and the solution)
- (issue related PRs) Add screen recording or steps to reproduce the issue
- (issue related PRs) Add screen recording or test to verify the fix

## Publishing packages

For more information visit [publish documentation](https://github.com/clerkinc/javascript/blob/main/docs/PUBLISH.md).\_

## License

By contributing to Clerk, you agree that your contributions will be licensed under its MIT License.
