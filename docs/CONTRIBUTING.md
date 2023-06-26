# Contributing guide

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.
Please note we have a [code of conduct](https://github.com/clerkinc/javascript/blob/main/docs/CODE_OF_CONDUCT.md), please follow it in all your interactions with the project.

<details open="open">
<summary><strong>TABLE OF CONTENTS</strong></summary>

- [Contributing guide](#contributing-guide)
  - [Monorepo setup](#monorepo-setup)
  - [Developing locally](#developing-locally)
    - [Setting up your local environment](#setting-up-your-local-environment)
    - [Making changes to local packages](#making-changes-to-local-packages)
    - [Making changes to hot-loaded clerk-js](#making-changes-to-hot-loaded-clerk-js)
  - [Opening a Pull Request](#opening-a-pull-request)
    - [Changeset](#changeset)
    - [Commit messages](#commit-messages)
    - [What is the difference between a commit message, a PR description and a changeset description?](#what-is-the-difference-between-a-commit-message-a-pr-description-and-a-changeset-description)
    - [Notes on Pull Requests](#notes-on-pull-requests)
  - [Issues and feature requests](#issues-and-feature-requests)
  - [Publishing packages](#publishing-packages)
  - [License](#license)

</details>

## Developing locally

This section is a work-in-progress. More details will be added soon.

### Monorepo setup

The current monorepo setup is based on:

- [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces), used for managing all Clerk packages from within a single repository.
- [Turborepo](https://turbo.build/repo/docs), used for task running and task output caching.
- [Changesets](https://github.com/changesets/changesets), used for package versioning, publishing and changelog generation.
- [GitHub Actions](https://docs.github.com/en/actions), used for quality checks and automated release orchestration.
- [Yalc](https://github.com/wclr/yalc), used for to publish packages locally and test them in other local projects.

### Prerequisites

Have a node version installed that is equal or higher than the one defined in `.nvmrc`

### Setting up your local environment

To set up your development environment, please follow these steps:

1. Clone the repo

   ```sh
   git clone https://github.com/clerkinc/javascript
   ```

2. Install the dependencies. We're using npm workspaces, so you **should always run `npm istall` from the root of the monorepo**, as it will install dependencies for all the packages:

   ```sh
   cd javascript
   npm install
   ```

3. Build all the packages in the monorepo by running:

   ```sh
   npm run build
   ```

For package specific setup, refer to the `Build` section of the specific package (eg packages/<package_name>/README.md#build).

### Making changes to packages

WIP

### Making changes to the hot-loaded `clerk-js`

WIP

## Opening a Pull Request

1. Search our repository for open or closed
   [Pull Requests](https://github.com/clerkinc/javascript/pulls)
   that relate to your submission. You don't want to duplicate effort.
2. Fork the project
3. Create your feature branch (`git checkout -b feat/amazing_feature`)
4. If required, create a `changeset` that describes your changes (`npm run changeset`). In cases where a changeset is not required, an empty changeset can be created instead (`npm run changeset:emtpy`) - an empty changeset will not generate a changelog entry for the change, so please use it as an escape hatch or for internal refactors only.
5. Commit your changes (`git commit -m 'feat: Add amazing_feature'`)
6. Push to the branch (`git push origin feat/amazing_feature`)
7. [Open a Pull Request](https://github.com/clerkinc/javascript/compare?expand=1). Make sure the description includes enough information for the reviewer to understand what the PR is about.
8. Follow the instructions of the pull request template

### Changesets

For more details about changesets, see [Adding a Changeset](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md).
A changeset is a piece of information about changes made in a branch or commit. It holds three bits of information:

- What we need to release
- What version we are releasing packages at (using a semver bump type)
- A changelog entry for the released packages

The first of the changeset description is used as the changelog entry title, the rest of the description is used as the changelog entry body. For example:

```markdown
---
'@clerk/nextjs': minor
---

Introduce `debug` prop in `authMiddleware`
A new `debug` prop has been added to the `authMiddleware` function. When set to `true`, the middleware will log the request and response to the console.
```

Will generate the following changelog entry:

```markdown
## Minor Changes

- Introduce `debug` prop in `authMiddleware` (#123) by @johndoe
  A new `debug` prop has been added to the `authMiddleware` function. When set to `true`, the middleware will log the request and response to the console.
```

Tips:

- Changesets are just markdown files. Feel free to add as much markdown as you want to better describe the change.
- Multiple changesets can be added in a single PR if needed, please see [Tips on adding changesets](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md#you-can-add-more-than-one-changeset-to-a-pull-request)

#### Why We Use Changesets

Great release notes and changelogs are an incredibly important trait of good software. We are always working hard at Clerk to bring updates and improvements to our libraries. And while we believe that this is a good thing, it also means we need to be responsible to our users in making clear what these changes are in a way that is as brief, clear, and understandable as possible. We have all seen libraries that publish changelogs as a list of commits, and I don't think many would argue that while this makes it easy for library developers, it's far from ideal for library users. To reach the standards we have for our library users' experience with Clerk, there is nothing that beats hand-written changelogs by the developers who worked on the features, and this is exactly what changesets empowers us to provide.

Changesets provides streamlined tooling and enforcement to ensure that developers working on features have as easy of a time as possible writing great changelogs, and puts together release notes for us at the quality bar that we strive for. Make sure to think from the perspecitve of a user when writing changesets to make it crystal clear what your feature is, what impact is has on the library, how to use it, and how to find more detail, if relevant.

### Commit messages

Even though we don't use commit messages to track changes between releases, all commit messages need to respect the [conventional-commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
Use of a `type` and a `scope` in commit message is **mandatory**.

As per the conventional commits specification, the `type` can be one of the following: `feat`, `fix`, `chore`, `docs`. The `scope` can be one of the package names defined in `packages/{package}/package.json`, `repo` for repository level changes or `release` for releases.

### What is the difference between a commit message, a PR description and a changeset description?

All of these are used to describe changes in the codebase, but they have different purposes:

- **Commit message**: Briefly describe what the commit is about. Intended to be seen by contributors.
- **Commit description**: Describe in details why the change was made and include some details about the implementation if needed. Intended to be seen by contributors.
- **PR description**: Describe in details what the PR is about. This is the first thing a reviewer will see when reviewing a PR, so make sure to explain why the change is needed and offer plenty of details about the actual implementation. It's always useful to include a screen recording or steps to reproduce the issue if the PR is related to a bug fix. Also try to include resources and extenral documentation if required. Intended to be seen by contributors and will be used as future reference.
- **Changeset description**: Describe in details how the change affects the user. This is the first thing a user will see when a new release is published, so make sure to explain how the change affects them. Try to provide usage examples and migration steps if required. Intended to be seen by users of the package.

### Notes on Pull Requests

- Prefer multiple small PRs with related changes (easier to review and provide feedback)
- Always add description in PRs (describe high level the issue and the solution)
- (issue related PRs) Add screen recording or steps to reproduce the issue
- (issue related PRs) Add screen recording or test to verify the fix

## Issues and feature requests

You've found a bug in the source code, a mistake in the documentation or maybe you'd like a new feature? You can help us by [submitting an issue on GitHub](https://github.com/clerkinc/javascript/issues). Before you create an issue, make sure to search the issue archive - your issue may have already been addressed! Please try to create bug reports that are:

- _Reproducible_: Include steps to reproduce the problem.
- _Specific_: Include as much detail as possible: which version, what environment, etc.
- _Unique_: Do not duplicate existing opened issues.
- _Scoped to a Single Bug_: One bug per report.

**Even better: Submit a pull request with a fix or new feature!**

## Publishing packages

_Note: Only core maintainers can publish packages._

For more information visit [publish documentation](https://github.com/clerkinc/javascript/blob/main/docs/PUBLISH.md).

## License

By contributing to Clerk, you agree that your contributions will be licensed under its MIT License.
