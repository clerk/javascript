<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_eslint_plugin" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# @clerk/eslint-plugin

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_eslint_plugin)
[![Follow on X](https://img.shields.io/twitter/follow/clerk?style=social)](https://x.com/intent/follow?screen_name=clerk)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/eslint-plugin/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_eslint_plugin)

</div>

## Overview

> [!NOTE]
> This lint rule is experimental, but should already be working well.
>
> We encourage trying it out and getting in touch with us about your experience.
>
> If you try it out, pin your version as we might do breaking changes in minors before v1.

ESLint rules to help with Clerk patterns across JavaScript frameworks.

Currently includes a Next.js App Router rule to help enforce protecting resources where they are used. Instead of relying on a proxy matcher, you declare which folders are protected and the `require-auth-protection` rule flags any `page`, `layout`, `template`, `default`, `route`, or Server Function under those folders that doesn't guard itself.

Client components are not checked by the rule. These can only get privileged access through other protected resources, or via external API calls which are assumed to be separately protected.

The rule only detects protected or not, which corresponds to signed in/signed out. You are still responsible for making sure the checks are _correct_ and that the user has the correct permissions to access the resource.

> The config **declares intent for tooling — it does not guard anything at runtime.** Protection only happens when each resource calls `await auth.protect()` (or an equivalent check). This rule verifies that it does.

## Installation

```sh
npm install --save-dev @clerk/eslint-plugin
```

Requires ESLint `>=9` (flat config).

## Usage

Register the plugin and declare your protected/public folder globs in `eslint.config.mjs`:

```js
import clerkNext from '@clerk/eslint-plugin/next';

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

| Option              | Type                  | Default  | Description                                                                                                                                                                                              |
| ------------------- | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `protected`         | `string[]` (required) | —        | Folder globs whose resources must be guarded.                                                                                                                                                            |
| `public`            | `string[]`            | `[]`     | Folder globs that are exempt.                                                                                                                                                                            |
| `resources`         | `object`              | all true | Resource groups to check. Supports `routeHandlers`, `serverFunctions`, and `serverComponentEntrypoints`, each as an optional boolean.                                                                    |
| `mixedScopeLayouts` | `'auto' \| string[]`  | `'auto'` | Layouts/templates that intentionally wrap both protected and public descendants. `'auto'` allows them silently; a list requires each such folder to be acknowledged explicitly.                          |
| `rootDir`           | `string`              | _(auto)_ | Directory folder globs are resolved against. Defaults to the nearest ancestor `eslint.config.*`, then ESLint `cwd`. Set to `import.meta.dirname` in your config file when auto-discovery is unavailable. |

Globs use a minimal dialect — only `*` (single segment) and `**` (any depth). When a folder matches both `protected` and `public`, the most specific pattern wins, and `protected` wins ties.

Use `resources` to disable whole resource groups when a project only wants this rule to enforce protection for some App Router resources:

```js
{
  protected: ['app/**'],
  resources: {
    routeHandlers: true,
    serverFunctions: true,
    serverComponentEntrypoints: false,
  },
}
```

We recommend leaving all as true, but switching some off can be useful during incremental migrations. This configuration also scopes suggestions and bulk-fix tooling: disabled resource groups are not reported by the rule, so they will not receive editor quick-fixes or bulk-applied fixes.

## What counts as protected

The rule is satisfied when the relevant function guards itself at the top, either by calling `auth.protect()`:

```ts
import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  await auth.protect();
  // A protect call with a more narrow role or permissions check also works:
  await auth.protect({ role: 'org:admin' });

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

General protection must happen at the top of the function, but additional narrowing auth checks can happen further down.

## Suggestions

For each unprotected resource it flags, the rule offers an editor quick-fix suggestion that inserts `await auth.protect()` at the top of the function (making it `async` and adding the `import { auth } from '@clerk/nextjs/server'` import if needed). Suggestions are opt-in: they appear in your editor's quick-fix menu and are not applied by `eslint --fix`, since adding a protection check changes runtime behavior.

## Bulk auto-fixing

> [!WARNING]
> Applying these fixes changes the runtime behavior of your application — `await auth.protect()` enforces authentication where there potentially was none, or might override custom auth checks that were already in place. Always review the changes and test your application afterwards.

Because the protection insertion is a suggestion rather than an autofix, `eslint --fix` deliberately won't apply it. To apply it across many files at once, use the bundled command, which lints with your existing ESLint config (so your protected/public globs are honored) and applies the suggestion to every resource it can safely fix:

```sh
# Fix everything under the current directory
npx clerk-next-fix-auth-protection

# Preview without writing
npx clerk-next-fix-auth-protection --dry-run

# Scope fixes to a specific pattern, this will still
# use protected/public from your ESLint config, but
# can be useful to only fix a subset of your application
npx clerk-next-fix-auth-protection "app/**"
```

Resources the rule can't safely fix on its own (imported/wrapped exports, unacknowledged mixed-scope layouts) are listed as needing manual attention, and the command exits non-zero when any remain (or when `--dry-run` would make changes).

The same logic is available programmatically:

```ts
import { fixAuthProtection } from '@clerk/eslint-plugin/next/fix-auth-protection';

const { fixed, unresolved } = await fixAuthProtection({
  patterns: ['app/**'],
  dryRun: false,
});
```

## Implementation details

This section describes the exact details of how the lint rule works. You normally do not need to read or understand this if you only want to use the rule.

Within folders that are configured as protected (and that eslint covers), this rule checks these resources when their resource group is enabled:

- No files with `'use client'` at the top - Early bailout for these
- `serverComponentEntrypoints`: the default export of `page`, `layout`, `template`, and `default` files
- `routeHandlers`: all http verb exports of `route` files (`GET`, `POST` etc - API endpoints)
- `serverFunctions`: all exports of files with `'use server'` at the top, and all inline functions that have `'use server'` at the top of the function

Notably, it does not:

- Check `loading` or `error` files
  - These normally don't use privileged resources, but if yours do, make sure you protect them
- Check arbitrary Server Components
  - Only the different page entrypoints listed above are checked
  - If you are importing a Server Component doing privileged access into a non-protected page, like an admin panel on an otherwise public page, it should be guarded but the lint rule does not detect this

At the top of the relevant async function, after any directives or TypeScript-only declarations, to count as protected the rule accepts these patterns:

```tsx
// -- Using the default .protect() behavior --
await auth.protect()
await (await auth()).protect()
// Any kind of variable declaration is okay
const { userId } = await auth.protect();

// -- Custom handling --
const { isAuthenticated, userId, sessionId } = await auth();
// Any of these checks are okay
// Note: For useAuth() on the client !userId can also mean
// "loading", but here it's fine
if (
  !userId || userId == null || userId === null ||
  !sessionId || sessionId == null || sessionId === null ||
  !isAuthenticated
) {
  // It is fine to have arbitrary code here:
  console.log('Unauthenticated');
  // To count as protected, the function needs to have an
  // unconditional "exit" at the top level, these count:
  return;
  throw;
  // The Next.js versions of these functions throw errors
  // and counts as exits, note that we match these by name,
  // we do not currently trace them back to the real imports
  redirect();
  permanentRedirect();
  notFound();
  unauthorized();
  forbidden();
}
```

## Support

For help, visit our [support page](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_eslint_plugin).

## Contributing

We're open to all community contributions! Please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## Security

`@clerk/eslint-plugin` is a static analysis aid, not a runtime guard. It's provided to _help_ you catch missing protections and it does error on the side of caution, but there are no guarantees it will catch everything, there might be edge cases it does not catch.

We aim to fix bugs leading to false negatives promptly, but they are not considered vulnerabilities and will not lead to us posting advisories. You are free to file lint rule bugs via normal [GitHub issues](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml).

_For more information and to report what you think is a security issue, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/eslint-plugin/LICENSE) for more information.
