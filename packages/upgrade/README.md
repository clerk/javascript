<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_upgrade" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
  <h1 align="center">@clerk/upgrade</h1>
</p>

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_upgrade)
[![Follow on Twitter](https://img.shields.io/twitter/follow/Clerk?style=social)](https://twitter.com/intent/follow?screen_name=Clerk)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/upgrade/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_upgrade)

</div>

## Getting Started

A CLI that detects your installed Clerk SDK, upgrades packages to the next major release, runs codemods, and scans your codebase for breaking changes.

### Prerequisites

- Node.js `>=20.9.0`
- pnpm, npm, or yarn installed in the target project

## Usage

Run the CLI from the root of the project you want to upgrade:

```sh
# with pnpm
pnpm dlx @clerk/upgrade

# with npm
npx @clerk/upgrade

# if installed locally
pnpm clerk-upgrade
```

Fill out the prompts and the CLI will:

- Detect your Clerk SDK and version (or prompt for `--sdk`)
- Upgrade packages (including renames such as `@clerk/clerk-react` → `@clerk/react`)
- Run codemods for the selected release
- Scan your files for breaking changes and print a report

### CLI options

- `--sdk` — SDK to upgrade (e.g., `nextjs`, `react`, `expo`); required in non-interactive runs if detection fails
- `--dir` — directory to scan (default: current working directory)
- `--glob` — glob of files for codemods (default: `**/*.(js|jsx|ts|tsx|mjs|cjs)`)
- `--ignore` — extra globs to ignore during scans (repeatable)
- `--release` — target release (e.g., `core-3`); otherwise auto-selected from installed versions
- `--skip-upgrade` — skip installing/updating packages
- `--skip-codemods` — skip codemod execution
- `--dry-run` — show what would change without writing or installing

### Releases

- `core-3`: upgrades Next.js 6 → 7, React 5 → 7, Expo 2 → 3, React Router 2 → 3, TanStack React Start 0 → 1, Astro 2 → 3, Nuxt 2 → 3, Vue 2 → 3; includes package renames for React/Expo

The CLI selects the appropriate release automatically based on the installed major version, or you can pin a release with `--release` (currently `core-3`).

### Caveats

Scans rely on regular expressions, so some patterns (unusual imports, bound methods, indirect calls) can be missed. Codemods cover common upgrades, but you should still review the report, run your test suite, and verify the app before deploying.

The main thing that this tool will miss is cases where _unusual import patterns_ are used in your codebase. As an example, if Clerk made a breaking change to the `getAuth` function exported from `@clerk/nextjs`, `@clerk/upgrade` would likely look for something like `import { getAuth } from "@clerk/nextjs"` in order to detect whether you need to make some changes. If you were using your imports like `import * as ClerkNext from "@clerk/nextjs"`, you could use `getAuth` without it detecting it with its matcher.

It will also be very likely to miss if you bind a method on an object to a separate variable and call it from there, or pass a bound method through a function param. For example, something like this:

```js
const updateUser = user.update.bind(user);

updateUser({ username: 'foo' });
```

Overall, there's a very good chance that this tool catches everything, but it's not a guarantee. Make sure that you also test your app before deploying, and that you have good E2E test coverage.

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- On [our support page](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_upgrade)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## Security

`@clerk/upgrade` follows good practices of security, but 100% security cannot be assured.

`@clerk/upgrade` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/upgrade/LICENSE) for more information.
