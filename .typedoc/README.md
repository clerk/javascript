# Clerk + Typedoc

## Introduction

Together with [`typedoc.config.mjs`](../typedoc.config.mjs) this folder contains all relevant configuration of our [Typedoc](https://typedoc.org/) usage.

Throughout our packages we use JSDoc to annotate public APIs, for example:

```ts
/**
 * Accepts an `unknown` value and determines if it's truthy or not.
 *
 * @returns {boolean} Returns true for `true`, true, positive numbers. Returns false for `false`, false, 0, negative integers and anything else.
 */
export function isTruthy(value: unknown): boolean {
  // Return if Boolean
  if (typeof value === `boolean`) {
    return value;
  }

  // Default to false
  return false;
}
```

With our Typedoc configuration this will get turned into a file inside `.typedoc/docs` like so:

```md
Accepts an `unknown` value and determines if it's truthy or not.

## Parameters

| Parameter | Type      |
| --------- | --------- |
| `value`   | `unknown` |

## Returns

Returns true for `true`, true, positive numbers. Returns false for `false`, false, 0, negative integers and anything else.
```

The [tags](https://typedoc.org/documents/Tags.html) are turned into markdown files that [clerk.com/docs](https://clerk.com/docs) can consume.

## Setup

Our Typedoc setup is controlled by the [`typedoc.config.mjs`](../typedoc.config.mjs) configuration file. On a high-level, the goals of the configuration are:

- Consume all SDKs inside `packages`
  - But define their entrypoints manually
- Remove as much unwanted content as possible
  - Therefore any `@hidden`, `@internal`, or undocumented APIs are ignored
- Generate MDX output that can be directly used inside [clerk-docs](https://github.com/clerk/clerk-docs)

Most of the heavy lifting of generating the MDX output is done through [typedoc-plugin-markdown](https://typedoc-plugin-markdown.org/).

Inside [`custom-theme.mjs`](./custom-theme.mjs) and [`custom-plugin.mjs`](./custom-plugin.mjs) the MDX output is adjusted to our needs. Both `typedoc` and `typedoc-plugin-markdown` offer hooks and extenable classes/themes to customize the output.

The goals of these customizations are:

- Ensure no links are 404
- Adjust style preferences to match with existing, handwritten content in Clerk's docs
- Have a stable, predictable, and reasonable folder structure/output inside `.typedoc/docs`
  - These file paths will be used inside `<Typedoc />` components in [clerk-docs](https://github.com/clerk/clerk-docs)
- Again, remove unwanted content to have MDX files for docs consumption

## Usage

To generate the Typedoc MDX files inside `.typedoc/docs` run the following script in the root of the repository:

```shell
pnpm run typedoc:generate
```

The `.typedoc/docs` folder is inside the `.gitignore` on purpose. Its contents will be pushed to [clerk/clerk-docs](https://github.com/clerk/clerk-docs/tree/main/clerk-typedoc) in CI. You can use it to debug and tweak the output locally before it gets published.

### Adding a package to the Typedoc output

Make sure that the package directory is listed inside [`typedoc.config.mjs`](../typedoc.config.mjs) `config.entryPoints`. Afterwards Typedoc will inspect the `exports` map and `main` key inside `package.json` to determine the entrypoints for the package.

If for some reason this doesn't work, spend time investigating it. If afterwards it still doesn't work, you can add a `typedoc.json` file to the package and define the `entryPoints` there.

> [!IMPORTANT]
> If you're generating documentation for files/APIs that are not exported/accessible to a user, it's an error. Unless you want to limit the entry points (e.g. a package exports internal functionality) or modify things like the `compilerOptions`, you probably should not define a custom `typedoc.json` file inside a package.
