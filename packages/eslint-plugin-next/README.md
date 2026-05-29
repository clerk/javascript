<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_eslint_plugin_next" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# @clerk/eslint-plugin-next

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_eslint_plugin_next)
[![Follow on X](https://img.shields.io/twitter/follow/clerk?style=social)](https://x.com/intent/follow?screen_name=clerk)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/eslint-plugin-next/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_eslint_plugin_next)

</div>

## Overview

> [!NOTE]
> This lint rule is experimental, but should already be working well.
>
> We encourage trying it out and getting in touch with us about your experience.

ESLint rules to help with Clerk patterns in the Next.js App Router.

Currently contains a single rule to help enforce protecting resources where they are used. Instead of relying on a proxy matcher, you declare which folders are protected and the `require-auth-protection` rule flags any `page`, `layout`, `template`, `default`, `route`, or Server Action under those folders that doesn't guard itself.

The rule only detects protected or not, which corresponds to signed in/signed out. You are still responsible for making sure the checks are _correct_ and that the user has the correct permissions to access the resource.

> The config **declares intent for tooling — it does not guard anything at runtime.** Protection only happens when each resource calls `await auth.protect()` (or an equivalent check). This rule verifies that it does.

## Installation

```sh
npm install --save-dev @clerk/eslint-plugin-next
```

Requires ESLint `>=9` (flat config).

## Usage

Register the plugin and declare your protected/public folder globs in `eslint.config.mjs`:

```js
import clerkNext from '@clerk/eslint-plugin-next';

export default [
  {
    plugins: { '@clerk/next': clerkNext },
    rules: {
      '@clerk/next/require-auth-protection': [
        'error',
        {
          protected: ['app/**'],
          public: ['app/sign-in/**', 'app/sign-up/**'],
        },
      ],
    },
  },
];
```

## Options

| Option              | Type                  | Default  | Description                                                                                                                                                                     |
| ------------------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `protected`         | `string[]` (required) | —        | Folder globs whose resources must be guarded.                                                                                                                                   |
| `public`            | `string[]`            | `[]`     | Folder globs that are exempt.                                                                                                                                                   |
| `mixedScopeLayouts` | `'auto' \| string[]`  | `'auto'` | Layouts/templates that intentionally wrap both protected and public descendants. `'auto'` allows them silently; a list requires each such folder to be acknowledged explicitly. |

Globs use a minimal dialect — only `*` (single segment) and `**` (any depth). When a folder matches both `protected` and `public`, the most specific pattern wins, and `protected` wins ties.

## What counts as protected

The rule is satisfied when the relevant function guards itself at the top, either by calling `auth.protect()`:

```ts
import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  await auth.protect();
  // ...
}
```

…or by an early-exit check derived from `auth()` that returns, throws, or calls `notFound()` / `redirect()`:

```ts
import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  const { userId } = await auth();
  if (userId === null) notFound();
  // ...
}
```

Recognized checks include `!isAuthenticated`, `isAuthenticated === false`, `userId === null`, and `sessionId === null` (from `auth()` imported as `@clerk/nextjs/server`). Client components (`'use client'`) are skipped.

General protection must happen at the top of the function, but additional narrowing auth checks can happen further down.

## Support

For help, visit our [support page](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_eslint_plugin_next).

## Contributing

We're open to all community contributions! Please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## Security

`@clerk/eslint-plugin-next` is a static analysis aid, not a runtime guard. It's provided to help you catch missing protections and it does error on the side of caution, but there are no guarantees there might not be edge cases it fails to detect.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/eslint-plugin-next/LICENSE) for more information.
