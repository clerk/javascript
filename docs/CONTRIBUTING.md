# Contributing guide

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.
Please note we have a [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md), please follow it in all your interactions with the project.

<details open="open">
<summary><strong>Table of contents</strong></summary>

- [Contributing guide](#contributing-guide)
  - [Developing locally](#developing-locally)
    - [Monorepo setup](#monorepo-setup)
    - [Prerequisites](#prerequisites)
    - [Setting up your local environment](#setting-up-your-local-environment)
    - [Documenting your changes](#documenting-your-changes)
    - [Writing tests](#writing-tests)
    - [Authoring Typedoc information](#authoring-typedoc-information)
  - [Opening a Pull Request](#opening-a-pull-request)
    - [Changesets](#changesets)
    - [Commit messages](#commit-messages)
    - [What is the difference between a commit message, a PR description and a changeset description?](#what-is-the-difference-between-a-commit-message-a-pr-description-and-a-changeset-description)
    - [Notes on Pull Requests](#notes-on-pull-requests)
  - [Issues and feature requests](#issues-and-feature-requests)
  - [Localizations](#localizations)
  - [Publishing packages](#publishing-packages)
  - [License](#license)

</details>

## Developing locally

### Monorepo setup

The current monorepo setup is based on:

- [pnpm workspaces](https://pnpm.io/workspaces), used for managing all Clerk packages from within a single repository.
- [Turborepo](https://turbo.build/repo/docs), used for task running and task output caching.
- [Changesets](https://github.com/changesets/changesets), used for package versioning, publishing and changelog generation.
- [GitHub Actions](https://docs.github.com/en/actions), used for quality checks and automated release orchestration.
- [Yalc](https://github.com/wclr/yalc), used for to publish packages locally and test them in other local projects.
- [Jest](https://jestjs.io/) or [Vitest](https://vitest.dev/), used for running unit tests.
- [Playwright](https://playwright.dev/), used for running the [integration](../integration/) test suite.

All packages of the monorepo are inside [packages](../packages). For package specific details on installation, architecture and usage, you can refer to the package's README file.

- [`@clerk/backend`](../packages/backend): Functionalities regarded as "core" for Clerk to operate with. _Authentication resolution, API Resources etc._
- [`@clerk/clerk-js`](../packages/clerk-js): Core JavaScript implementation used by Clerk in the browser.
- [`@clerk/react`](../packages/react) Clerk package for React applications.
- Browse [packages](../packages) to see more

Additionally there are packages which act as shared utilities or building blocks.

### Prerequisites

Ensure that you have Node.js installed ([How to install Node.js](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs)). Its version should be equal or higher than the one defined in `.nvmrc` in the root of the repository.

### Setting up your local environment

To set up your development environment, please follow these steps:

1. Clone the repo

```sh
git clone https://github.com/clerk/javascript
```

1. Enable `pnpm` package manager.

```sh
corepack enable
```

1. Install the dependencies. We're using pnpm workspaces, so you **should always run `pnpm install` from the root of the monorepo**, as it will install dependencies for all the packages:

```sh
cd javascript
pnpm install
```

1. Build all the packages in the monorepo by running:

```sh
pnpm build
```

> [!IMPORTANT]
> Ensure you are using the latest or LTS version of Node.

This ensures that all internal TypeScript types are generated and any dependencies between packages are resolving.

Once you're ready to make changes, run `pnpm dev` from the monorepo root.

If you want to run the `dev` script of an individual package, navigate to the folder and run the script from there. This way you can also individually run the `build` script.

### Documenting your changes

Updating documentation is an important part of the contribution process. If you are changing existing behavior or adding a new feature, make sure [Clerk's documentation](https://github.com/clerk/clerk-docs) is also updated.

To improve the in-editor experience when using Clerk's SDKs, we do our best to add [JSDoc comments](https://jsdoc.app/about-getting-started.html) to our package's public exports. The JSDoc comments should not attempt to duplicate any existing type information, but should provide meaningful additional context or references. If you are adding a new export, make sure it has a JSDoc comment. If you are updating an existing export, make sure any existing comments are updated appropriately.

There are some styleguide decisions you should follow when authoring JSDoc comments:

- In addition to the description, also annotate the parameters and return types (if applicable)
- Provide one or more `@example` if you're documenting a function
  - Use `###` (h3) headings and a description for each example
- When using links, make sure that they are **absolute** links (e.g. `[Clerk docs](https://clerk.com/docs)`).
- Provide a `@default` annotation when describing an optional property that will receive a default value
- Follow the `clerk-docs` styleguides on [code blocks](https://github.com/clerk/clerk-docs/blob/main/CONTRIBUTING.md#code-blocks), [callouts](https://github.com/clerk/clerk-docs/blob/main/CONTRIBUTING.md#callouts)

Here's an example of an excellent documented function that showcases the different styleguide instructions:

````ts
type FnParameters = {
  /**
   * Input to the function with a lengthy and good description.
   */
  input: string | Array<string>;
  /**
   * Optional parameter with a default value.
   * @default false
   */
  isOffline?: boolean;
};

type FnReturn = Array<string>;

/**
 * Some long description goes here.
 *
 * > [!NOTE]
 * > This is a note that will be rendered in the documentation.
 *
 * @example
 * ### Example 1
 *
 * This shows how to use the function with a single string input.
 *
 * ```tsx
 * const result = exampleFunction({ input: 'example' });
 * console.log(result); // Output: ['example']
 * ```
 *
 * @example
 * ### Example 2
 *
 * This shows how to use the function with an array of strings as input.
 *
 * ```tsx
 * const result = exampleFunction({ input: ['example1', 'example2'] });
 * console.log(result); // Output: ['example1', 'example2']
 * ```
 */
export function exampleFunction({ input, isOffline = false }: FnParameters): FnReturn {
  if (isOffline) {
    return [];
  }

  if (Array.isArray(input)) {
    return input;
  }

  return [input];
}
````

### Writing tests

When changing functionality or adding completely new code it's highly recommended to add/edit tests to verify the new behavior.

Inside the repository you'll find two types of tests:

1. Unit tests
1. Integration tests

While changing a file inside a package, check if e.g. a `<name>.test.ts` file or a test inside a `__tests__` folder exists. If you add a completely new file, please add a unit test for it.

If your change can't only be tested by unit tests, you should add/edit an integration test. You can find all necessary information about this in the [integration tests README](../integration/README.md).

### Authoring Typedoc information

As explained in [documenting your changes](#documenting-your-changes), we use JSDoc to annotate our public API surface. We then use [Typedoc](https://typedoc.org/) to autogenerate MDX docs from these comments.

For a comprehensive guide on **authoring** JSDoc/Typedoc comments, see [this guide](https://www.notion.so/clerkdev/Typedoc-JSDoc-1df2b9ab44fe808a8cf2c9cca324ea89?source=copy_link).

To review your changes locally, you can run `pnpm run typedoc:generate` to generate the docs. Afterwards, you can inspect the MDX files inside `.typedoc/docs`. But if you want to preview how the Typedoc output will look in Clerk Docs, there's a few things you need to do first:

Create a PR that includes your changes to any Typedoc comments. Once the PR has been merged and a release is published, a PR will [automatically](https://github.com/clerk/clerk-docs/blob/main/.github/workflows/typedoc.yml) be opened in `clerk-docs` to merge in the Typedoc changes.

Typedoc output is embedded in `clerk-docs` files with the `<Typedoc />` component. For example, if you updated Typedoc comments for the `useAuth()` hook in `clerk/javascript`, you'll need to make sure that in `clerk-docs`, in the `/hooks/use-auth.mdx` file, there's a `<Typedoc />` component linked to the `./clerk-typedoc/react/use-auth.mdx` file, like:

```mdx
<Typedoc src='react/use-auth' />
```

Read more about this in the [`clerk-docs` CONTRIBUTING.md](https://github.com/clerk/clerk-docs/blob/main/CONTRIBUTING.md#typedoc-).

Then, to preview how the `<Typedoc />` component renders, the `clerk-docs` PR will have a Vercel preview. Or to get local previews set up, see the [section in `clerk/clerk` about setting up local docs](https://github.com/clerk/clerk?tab=readme-ov-file#5-optional-set-up-local-docs).

## Opening a Pull Request

1. Search our repository for open or closed [Pull Requests](https://github.com/clerk/javascript/pulls) that relate to your submission. You don't want to duplicate effort.
1. Fork the project
1. Create your feature branch (`git checkout -b feat/amazing_feature`)
1. It's highly recommended to [write tests](#writing-tests) to ensure your change works and will continue to work in the future
1. If required, create a `changeset` that describes your changes (`pnpm changeset`). In cases where a changeset is not required, an empty changeset can be created instead (`pnpm changeset:empty`) - an empty changeset will not generate a changelog entry for the change, so please use it as an escape hatch or for internal refactors only.
1. Commit your changes (`git commit -m 'feat: Add amazing_feature'`)
1. Push to the branch (`git push origin feat/amazing_feature`)
1. [Open a Pull Request](https://github.com/clerk/javascript/compare?expand=1). Make sure the description includes enough information for the reviewer to understand what the PR is about.
1. Follow the instructions of the pull request template

### Changesets

For more details about changesets, see [Adding a Changeset](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md).
A changeset is a piece of information about changes made in a branch or commit. It holds three bits of information:

- What we need to release
- What version we are releasing packages at (using a semver bump type)
- A changelog entry for the released packages

For example:

```markdown
---
'@clerk/nextjs': minor
---

Description goes here
```

Will generate the following changelog entry:

```markdown
## Minor Changes

- Description goes here (#123) by @johndoe
```

**Changelog entry framework**:

Keep it concise and as information-rich as possible. The most comprehensive changelog entry may include:

- What’s the type of change? - type
  - bug fix, feature, breaking change, chore, etc.
- What’s the TL;DR? - summary
- What more details can we share? - details
- What user benefit has this change? - benefit
- More information. Can we link to related things? - resources

A changelog entry should at least contain the **type** of change and a **summary**.

If your PR contains changes that require the user to update their code, explain **how** they can migrate.

**Tips**:

- Changesets are just markdown files. Feel free to add as much markdown as you want to better describe the change. If e.g. your changeset contains function or package names, use the `inline code` syntax to denote this.
- Multiple changesets can be added in a single PR if needed, please see [Tips on adding changesets](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md#you-can-add-more-than-one-changeset-to-a-pull-request)

#### Why We Use Changesets

Great release notes and changelogs are an incredibly important trait of good software. We are always working hard at Clerk to bring updates and improvements to our libraries. And while we believe that this is a good thing, it also means we need to be responsible to our users in making clear what these changes are in a way that is as brief, clear, and understandable as possible. We have all seen libraries that publish changelogs as a list of commits, and I don't think many would argue that while this makes it easy for library developers, it's far from ideal for library users. To reach the standards we have for our library users' experience with Clerk, there is nothing that beats hand-written changelogs by the developers who worked on the features, and this is exactly what changesets empowers us to provide.

Changesets provides streamlined tooling and enforcement to ensure that developers working on features have as easy of a time as possible writing great changelogs, and puts together release notes for us at the quality bar that we strive for. Make sure to think from the perspective of a user when writing changesets to make it crystal clear what your feature is, what impact is has on the library, how to use it, and how to find more detail, if relevant.

### Commit messages

Even though we don't use commit messages to track changes between releases, all commit messages need to respect the [conventional-commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
Use of a `type` and a `scope` in commit message is **mandatory**.

As per the conventional commits specification, the `type` can be one of the following: `feat`, `fix`, `chore`, `docs`. The `scope` can be one of the package names defined in `packages/{package}/package.json`, `repo` for repository level changes or `release` for releases.

### What is the difference between a commit message, a PR description, and a changeset description?

All of these are used to describe changes in the codebase, but they have different purposes:

- **Commit message**: Briefly describe what the commit is about. Intended to be seen by contributors.
- **Commit description**: Describe in details why the change was made and include some details about the implementation if needed. Intended to be seen by contributors.
- **PR description**: Describe in details what the PR is about. This is the first thing a reviewer will see when reviewing a PR, so make sure to explain why the change is needed and offer plenty of details about the actual implementation. It's always useful to include a screen recording or steps to reproduce the issue if the PR is related to a bug fix. Also try to include resources and external documentation if required. Intended to be seen by contributors and will be used as future reference.
- **Changeset description**: The target audience for these changelogs are other developers. So don’t shy away on including technical details or describing it with words that are generally known among developers. The goal of the changelog entry is to convey the benefit of upgrading to this version in a concise way. Try to provide usage examples and migration steps if required. Read the [changesets](#changesets) section to learn how to write great changesets.

### Notes on Pull Requests

- Prefer multiple small PRs with related changes (easier to review and provide feedback)
- Always add description in PRs (describe high level the issue and the solution)
- (issue related PRs) Add screen recording or steps to reproduce the issue
- (issue related PRs) Add screen recording or test to verify the fix

## Issues and feature requests

You've found a bug in the source code, a mistake in the documentation or maybe you'd like a new feature? You can help us by [submitting an issue on GitHub](https://github.com/clerk/javascript/issues). Before you create an issue, make sure to search the issue archive - your issue may have already been addressed! Please ensure that you have read and followed the bug report template, otherwise we will have to close the issue. You can submit a feature request by visiting [feedback.clerk.com](https://feedback.clerk.com).

Issues that have the label `needs-triage` have been seen by our team and are queued for triage internally. Issues that have the label `prioritized` have been discussed and are either in our backlog or being worked on actively. We do our best to prioritize work across a wide variety of sources, only one of which is github issues. While we understand that it can be frustrating if it takes a while for a patch to land, we ask for your understanding in that we have quite a lot of things that need to be worked on at any given time and are still a small team. And remember, the best way to get something fixed in an open source library is to contribute the fix yourself!

If you are a paying Clerk customer looking for support, please reach out directly to our support team by heading to https://www.clerk.com, clicking the chat bubble in the bottom right corner, and selecting "contact support".

## Localizations

If you want to add or edit localizations (e.g. how a button text is translated to your language), you can check out the [`localizations` README](../packages/localizations/README.md).

## Publishing packages

_Note: Only Clerk employees can publish packages._

For more information visit [publish documentation](https://github.com/clerk/javascript/blob/main/docs/PUBLISH.md).

## License

By contributing to Clerk, you agree that your contributions will be licensed under its MIT License.
